import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decryptJson } from '../_shared/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceRequest {
  amount: number;
  puppyName: string;
  puppyId: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const invoiceData: InvoiceRequest = await req.json();

    // 1. Get Square credentials from the database
    const { data: integration, error: configError } = await supabase
      .from('third_party_integrations')
      .select('*')
      .eq('service', 'square')
      .eq('is_active', true)
      .single();

    if (configError || !integration) {
      throw new Error("Square integration not configured or inactive.");
    }

    // 2. Decrypt credentials
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY');
    if (!encryptionKey) {
        throw new Error("ENCRYPTION_KEY is not set.");
    }
    const credentials = await decryptJson(integration.data_ciphertext, encryptionKey);
    const { access_token: accessToken, location_id: locationId, environment } = credentials;

    if (!accessToken || !locationId) {
        throw new Error("Invalid Square credentials.");
    }

    const baseUrl = environment === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    // 3. Find or create a Square Customer
    let customerId;
    const searchCustomerResponse = await fetch(`${baseUrl}/v2/customers/search`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: { filter: { email_address: { exact: invoiceData.customerEmail } } } }),
    });
    const searchResult = await searchCustomerResponse.json();

    if (searchResult.customers && searchResult.customers.length > 0) {
        customerId = searchResult.customers[0].id;
    } else {
        const [firstName, ...lastNameParts] = invoiceData.customerName.split(' ');
        const createCustomerResponse = await fetch(`${baseUrl}/v2/customers`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ given_name: firstName, family_name: lastNameParts.join(' '), email_address: invoiceData.customerEmail }),
        });
        const createResult = await createCustomerResponse.json();
        if (!createCustomerResponse.ok) throw new Error(`Failed to create customer: ${JSON.stringify(createResult.errors)}`);
        customerId = createResult.customer.id;
    }

    // 4. Create a Square Order
    const orderResponse = await fetch(`${baseUrl}/v2/orders`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            order: {
                location_id: locationId,
                customer_id: customerId,
                line_items: [{
                    name: `Adoption Deposit for ${invoiceData.puppyName}`,
                    quantity: '1',
                    base_price_money: { amount: Math.round(invoiceData.amount * 100), currency: 'USD' }
                }]
            }
        }),
    });
    const orderResult = await orderResponse.json();
    if (!orderResponse.ok) throw new Error(`Failed to create order: ${JSON.stringify(orderResult.errors)}`);
    const orderId = orderResult.order.id;

    // 5. Create a draft Invoice
    const invoiceResponse = await fetch(`${baseUrl}/v2/invoices`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            invoice: {
                order_id: orderId,
                primary_recipient: { customer_id: customerId },
                payment_requests: [{
                    request_type: 'BALANCE',
                    due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], // 7 days from now
                }],
                delivery_method: 'EMAIL',
                title: `Adoption Invoice for ${invoiceData.puppyName}`
            }
        }),
    });
    const invoiceResult = await invoiceResponse.json();
    if (!invoiceResponse.ok) throw new Error(`Failed to create invoice: ${JSON.stringify(invoiceResult.errors)}`);
    const invoiceId = invoiceResult.invoice.id;

    // 6. Publish the Invoice
    const publishResponse = await fetch(`${baseUrl}/v2/invoices/${invoiceId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: invoiceResult.invoice.version }),
    });
    const publishResult = await publishResponse.json();
    if (!publishResponse.ok) throw new Error(`Failed to publish invoice: ${JSON.stringify(publishResult.errors)}`);

    return new Response(
      JSON.stringify({ success: true, invoice: publishResult.invoice }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Invoice creation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});