-- Rename square columns to stripe in puppy_purchases
ALTER TABLE public.puppy_purchases 
  RENAME COLUMN square_invoice_id TO stripe_payment_intent_id;

-- Add stripe_customer_id to puppy_purchases
ALTER TABLE public.puppy_purchases 
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Rename square columns to stripe in payments
ALTER TABLE public.payments 
  RENAME COLUMN square_transaction_id TO stripe_payment_intent_id;

-- Rename square columns to stripe in pos_transactions
ALTER TABLE public.pos_transactions 
  RENAME COLUMN square_transaction_id TO stripe_payment_intent_id;

-- Add stripe_customer_id to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;