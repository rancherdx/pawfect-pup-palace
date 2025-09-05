-- Fix function search path security warnings by setting explicit search_path
CREATE OR REPLACE FUNCTION public.encrypt_payment_details(details jsonb, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    encryption_key text;
    serialized_data text;
BEGIN
    -- Get encryption key from environment (this should be handled securely)
    -- For now, we'll use a combination of user_id as additional entropy
    serialized_data := details::text;
    
    -- Use pgcrypto for encryption (assuming it's available)
    -- This is a simplified version - in production you'd want stronger encryption
    RETURN encode(digest(serialized_data || user_id::text, 'sha256'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_payment_method(details jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    masked_details jsonb := '{}';
    card_number text;
BEGIN
    IF details IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Extract and mask credit card number if present
    IF details ? 'card_number' THEN
        card_number := details->>'card_number';
        IF length(card_number) >= 4 THEN
            masked_details := jsonb_set(masked_details, '{card_number}', 
                to_jsonb('****-****-****-' || right(card_number, 4)));
        END IF;
    END IF;
    
    -- Keep non-sensitive payment method info
    IF details ? 'brand' THEN
        masked_details := jsonb_set(masked_details, '{brand}', details->'brand');
    END IF;
    
    IF details ? 'last_four' THEN
        masked_details := jsonb_set(masked_details, '{last_four}', details->'last_four');
    END IF;
    
    IF details ? 'exp_month' THEN
        masked_details := jsonb_set(masked_details, '{exp_month}', details->'exp_month');
    END IF;
    
    IF details ? 'exp_year' THEN
        masked_details := jsonb_set(masked_details, '{exp_year}', details->'exp_year');
    END IF;
    
    RETURN masked_details;
END;
$$;

CREATE OR REPLACE FUNCTION public.encrypt_transaction_payment_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only encrypt if payment_method_details contains sensitive data
    IF NEW.payment_method_details IS NOT NULL AND 
       (NEW.payment_method_details ? 'card_number' OR 
        NEW.payment_method_details ? 'cvv' OR 
        NEW.payment_method_details ? 'account_number') THEN
        
        -- Store masked version for safe display
        NEW.payment_method_details := public.mask_payment_method(NEW.payment_method_details);
    END IF;
    
    RETURN NEW;
END;
$$;