-- Create table to store manual security overrides/whitelists
CREATE TABLE IF NOT EXISTS public.security_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_fingerprint TEXT NOT NULL,
  approved_by UUID NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)
);

-- Enable RLS
ALTER TABLE public.security_overrides ENABLE ROW LEVEL SECURITY;

-- Admins can view all overrides
CREATE POLICY "Admins can view all overrides"
ON public.security_overrides
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can insert overrides
CREATE POLICY "Admins can insert overrides"
ON public.security_overrides
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can delete overrides
CREATE POLICY "Admins can delete overrides"
ON public.security_overrides
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX idx_security_overrides_user_device 
ON public.security_overrides(user_id, device_fingerprint);

CREATE INDEX idx_security_overrides_expires 
ON public.security_overrides(expires_at);

-- Add comment
COMMENT ON TABLE public.security_overrides IS 'Stores manual admin approvals/whitelists for suspicious login attempts, allowing legitimate users to bypass security checks';
