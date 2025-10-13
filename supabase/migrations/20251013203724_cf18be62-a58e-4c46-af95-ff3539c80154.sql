-- Phase 7: Email Suite Tables
CREATE TABLE email_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL CHECK (provider_name IN ('mailchannels', 'sendgrid', 'aws_ses', 'smtp_custom')),
  is_active BOOLEAN DEFAULT true,
  api_key_encrypted TEXT,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password_encrypted TEXT,
  last_test_at TIMESTAMPTZ,
  test_status TEXT CHECK (test_status IN ('success', 'failed', 'pending')),
  test_error_message TEXT,
  dkim_public_key TEXT,
  dkim_private_key_vault_id TEXT,
  dkim_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_name)
);

CREATE TABLE sent_emails_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES email_providers(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  message_id TEXT
);

-- Phase 8: Payment and Transaction Tables
CREATE TABLE payment_method_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  environment TEXT CHECK (environment IN ('sandbox', 'production')),
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  qr_code_url TEXT,
  payment_link TEXT,
  custom_instructions TEXT,
  last_tested_at TIMESTAMPTZ,
  test_status TEXT CHECK (test_status IN ('success', 'failed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE puppy_purchases 
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0;

-- Phase 9: POS System Tables
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE NOT NULL,
  customer_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  square_transaction_id TEXT,
  receipt_html TEXT,
  receipt_url TEXT,
  invoice_url TEXT,
  processed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE email_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_method_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_providers_super_admin_all"
  ON email_providers FOR ALL
  USING (has_role(auth.uid(), 'super-admin'::app_role));

CREATE POLICY "sent_emails_admin_select"
  ON sent_emails_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "payment_methods_admin_all"
  ON payment_method_configs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "services_public_select"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "services_admin_all"
  ON services FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "pos_transactions_admin_all"
  ON pos_transactions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES 
('transaction_settings', '{
  "default_tax_rate": 0.0,
  "state_tax_rates": {},
  "zip_tax_rates": {},
  "shipping_fee": 0,
  "handling_fee": 0,
  "documentation_fee": 0,
  "allow_pass_through_fees": false,
  "show_fee_breakdown": true
}'::jsonb),
('pos_settings', '{
  "receipt_logo_url": "",
  "business_name": "GDS Puppies",
  "business_address": "",
  "business_phone": "",
  "receipt_footer": "Thank you for your purchase!",
  "auto_print": false,
  "default_payment_method": "cash",
  "require_customer_info": false,
  "square_app_id": "",
  "square_access_token_encrypted": ""
}'::jsonb)
ON CONFLICT (key) DO NOTHING;