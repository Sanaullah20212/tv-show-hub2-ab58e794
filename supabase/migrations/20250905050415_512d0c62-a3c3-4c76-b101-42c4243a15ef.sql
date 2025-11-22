-- Add payment tracking and pending status to subscriptions
ALTER TYPE subscription_status ADD VALUE 'pending';
ALTER TYPE subscription_status ADD VALUE 'rejected';

-- Add payment information columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN payment_method TEXT CHECK (payment_method IN ('bkash', 'nagad')),
ADD COLUMN payment_last_digits TEXT CHECK (LENGTH(payment_last_digits) = 3),
ADD COLUMN admin_notes TEXT;

-- Update default status to pending for new subscriptions
ALTER TABLE public.subscriptions 
ALTER COLUMN status SET DEFAULT 'pending'::subscription_status;