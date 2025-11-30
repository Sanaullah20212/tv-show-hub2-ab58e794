-- Add pause functionality and upgrade tracking to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS is_paused boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS paused_days_remaining integer,
ADD COLUMN IF NOT EXISTS upgraded_from uuid REFERENCES public.subscriptions(id),
ADD COLUMN IF NOT EXISTS downgraded_from uuid REFERENCES public.subscriptions(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_paused ON public.subscriptions(is_paused);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);