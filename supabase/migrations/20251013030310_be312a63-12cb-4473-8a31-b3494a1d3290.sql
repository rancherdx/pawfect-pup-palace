-- Phase 8: Invoicing & Payment Tracking System

-- Create puppy_purchases table
CREATE TABLE public.puppy_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puppy_id UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_price NUMERIC NOT NULL,
  deposit_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'deposit_pending' CHECK (status IN ('deposit_pending', 'deposit_paid', 'balance_pending', 'fully_paid', 'cancelled')),
  square_invoice_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES public.puppy_purchases(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('square', 'email_invoice', 'ach', 'cash', 'check', 'other')),
  square_transaction_id TEXT,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices for performance
CREATE INDEX idx_puppy_purchases_puppy ON public.puppy_purchases(puppy_id);
CREATE INDEX idx_puppy_purchases_customer ON public.puppy_purchases(customer_id);
CREATE INDEX idx_puppy_purchases_status ON public.puppy_purchases(status);
CREATE INDEX idx_payments_purchase ON public.payments(purchase_id);

-- Enable RLS
ALTER TABLE public.puppy_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for puppy_purchases
CREATE POLICY "Admins can manage all purchases"
  ON public.puppy_purchases FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own purchases"
  ON public.puppy_purchases FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Authenticated users can create purchases"
  ON public.puppy_purchases FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- RLS Policies for payments
CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view payments for their purchases"
  ON public.payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.puppy_purchases
    WHERE puppy_purchases.id = payments.purchase_id
    AND puppy_purchases.customer_id = auth.uid()
  ));

-- Trigger for updated_at on puppy_purchases
CREATE TRIGGER update_puppy_purchases_updated_at
  BEFORE UPDATE ON public.puppy_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update remaining amount when payment is added
CREATE OR REPLACE FUNCTION public.update_purchase_remaining_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_paid NUMERIC;
  purchase_record RECORD;
BEGIN
  -- Get the purchase record
  SELECT * INTO purchase_record FROM puppy_purchases WHERE id = NEW.purchase_id;
  
  -- Calculate total paid for this purchase
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM payments
  WHERE purchase_id = NEW.purchase_id;
  
  -- Update remaining amount and status
  UPDATE puppy_purchases
  SET 
    remaining_amount = total_price - total_paid,
    deposit_amount = CASE 
      WHEN total_paid > 0 AND deposit_amount = 0 THEN total_paid
      ELSE deposit_amount
    END,
    status = CASE
      WHEN total_paid = 0 THEN 'deposit_pending'
      WHEN total_paid < total_price AND total_paid > 0 THEN 'balance_pending'
      WHEN total_paid >= total_price THEN 'fully_paid'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.purchase_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update purchase when payment is added
CREATE TRIGGER update_purchase_on_payment
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_purchase_remaining_amount();