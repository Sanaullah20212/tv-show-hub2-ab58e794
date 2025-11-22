-- Add payment tracking and pending status to subscriptions
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'rejected';

-- Add payment information columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('bkash', 'nagad')),
ADD COLUMN IF NOT EXISTS payment_last_digits TEXT CHECK (LENGTH(payment_last_digits) = 3),
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update default status to pending for new subscriptions
ALTER TABLE public.subscriptions 
ALTER COLUMN status SET DEFAULT 'pending'::subscription_status;

-- Add RLS policy for admins to update subscription status
CREATE POLICY IF NOT EXISTS "Admins can update subscription status" 
ON public.subscriptions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Add RLS policy for admins to update user types in profiles
CREATE POLICY IF NOT EXISTS "Admins can update user types" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::user_role));