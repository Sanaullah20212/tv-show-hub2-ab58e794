-- Drop the old constraint that only allows 3 digits
ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_payment_last_digits_check;

-- Add new constraint that allows both 3 and 4 digits
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_payment_last_digits_check 
CHECK (length(payment_last_digits) IN (3, 4));