
# Square API Integration Guide

This document outlines how Square API is integrated for payment processing in the Puppy Breeder App.

## Prerequisites

1. A Square Developer account
2. Square Application with appropriate permissions
3. API credentials (Access Token)

## Required Environment Variables

| Variable Name | Description |
|---------------|-------------|
| `SQUARE_ACCESS_TOKEN` | Your Square API access token |

## Setup Instructions

### 1. Create a Square Developer Account

1. Go to [Square Developer Portal](https://developer.squareup.com/)
2. Sign up for a developer account
3. Create a new application

### 2. Configure Application Settings

1. In the Square Developer Dashboard, configure your application:
   - Set the OAuth redirect URLs
   - Enable appropriate OAuth permissions
   - Generate an access token

### 3. Set Environment Variables

Using Cloudflare Workers:

```bash
wrangler secret put SQUARE_ACCESS_TOKEN
# Input your Square access token when prompted
```

## Integrating Square in Code

### Processing a Payment

```typescript
// src/worker/controllers/payment.ts
import { Client, Environment } from 'square';

export async function processPayment(req, env) {
  // Parse request body
  const { amount, currency, sourceId, customerId } = await req.json();
  
  // Initialize Square client
  const squareClient = new Client({
    accessToken: env.SQUARE_ACCESS_TOKEN,
    environment: env.ENV === 'production' ? Environment.Production : Environment.Sandbox
  });
  
  try {
    // Create payment
    const response = await squareClient.paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount,
        currency
      },
      idempotencyKey: crypto.randomUUID(),
      customerId
    });
    
    // Record payment in database
    await recordPayment(response, env);
    
    return new Response(JSON.stringify({
      success: true,
      paymentId: response.payment.id
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Square payment error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function recordPayment(paymentResponse, env) {
  const payment = paymentResponse.payment;
  
  // Store payment record in database
  const stmt = env.PUPPIES_DB.prepare(`
    INSERT INTO payments (
      id, square_payment_id, status, amount, 
      currency, source_type, receipt_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    payment.id,
    payment.status,
    payment.amountMoney.amount,
    payment.amountMoney.currency,
    payment.sourceType,
    payment.receiptUrl,
    Math.floor(Date.now() / 1000)
  );
  
  await stmt.run();
}
```

### Creating a Customer

```typescript
async function createCustomer(customerData, env) {
  const squareClient = new Client({
    accessToken: env.SQUARE_ACCESS_TOKEN,
    environment: env.ENV === 'production' ? Environment.Production : Environment.Sandbox
  });
  
  const { givenName, familyName, emailAddress, phoneNumber } = customerData;
  
  const response = await squareClient.customersApi.createCustomer({
    givenName,
    familyName,
    emailAddress,
    phoneNumber
  });
  
  return response.customer;
}
```

## Using the Square Web Payments SDK (Frontend)

Add the Square Web Payments SDK to your frontend:

```typescript
// src/components/checkout/SquarePaymentForm.tsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const SquarePaymentForm = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const [paymentForm, setPaymentForm] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load Square Web Payments SDK
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = initializePaymentForm;
    document.body.appendChild(script);
    
    return () => {
      if (paymentForm) {
        paymentForm.destroy();
      }
    };
  }, []);
  
  async function initializePaymentForm() {
    const payments = window.Square.payments('your-application-id', 'your-location-id');
    const card = await payments.card();
    
    const form = await card.attach('#card-container');
    setPaymentForm(form);
    setLoading(false);
  }
  
  async function handlePaymentSubmit() {
    setLoading(true);
    
    try {
      const result = await paymentForm.tokenize();
      
      if (result.status === 'OK') {
        // Send the source ID to your server for payment processing
        const response = await fetch('/api/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sourceId: result.token,
            amount: amount,
            currency: 'USD'
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          onPaymentSuccess(data);
        } else {
          throw new Error(data.error || 'Payment processing failed');
        }
      }
    } catch (error) {
      onPaymentError(error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="space-y-4">
      <div id="card-container" className="min-h-[100px] border rounded p-4"></div>
      
      <Button 
        onClick={handlePaymentSubmit} 
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </div>
  );
};

export default SquarePaymentForm;
```

## Handling Square Webhooks

Set up webhook handling to receive events from Square:

```typescript
// src/worker/controllers/webhooks.ts
export async function handleSquareWebhook(request, env) {
  const signature = request.headers.get('x-square-signature');
  
  if (!signature) {
    return new Response('Missing signature', { status: 401 });
  }
  
  // Verify webhook signature
  // Implementation depends on Square webhook version
  
  const event = await request.json();
  
  switch (event.type) {
    case 'payment.created':
      await handlePaymentCreated(event.data, env);
      break;
    case 'payment.updated':
      await handlePaymentUpdated(event.data, env);
      break;
    // Handle other event types
  }
  
  return new Response('Webhook received', { status: 200 });
}

async function handlePaymentCreated(data, env) {
  // Process payment created event
  // e.g., update order status
}

async function handlePaymentUpdated(data, env) {
  // Process payment updated event
  // e.g., handle payment status changes
}
```

## Mobile Tap to Pay Integration

For in-person payments using the Square POS app:

1. Create an order in your system
2. Generate a Square Order ID
3. Create a deep link to the Square POS app

```typescript
function generateSquarePOSLink(orderId, amount, currencyCode = 'USD') {
  const params = new URLSearchParams({
    order_id: orderId,
    amount,
    currency_code: currencyCode
  });
  
  return `square-commerce-v1://payment/create?${params.toString()}`;
}

// Usage
const posLink = generateSquarePOSLink('order-123', '1500', 'USD');
// Link will open Square POS app for $15.00 payment
```

## Security Considerations

1. Always process payments server-side, never client-side
2. Store the Square access token securely (as a Cloudflare secret)
3. Implement idempotency keys to prevent duplicate charges
4. Use webhook signatures to verify webhook requests
5. Follow PCI compliance guidelines

## Additional Resources

- [Square Payment Form Documentation](https://developer.squareup.com/docs/web-payments/payment-form)
- [Square API Reference](https://developer.squareup.com/reference/square)
- [Square Developer Dashboard](https://developer.squareup.com/apps)
