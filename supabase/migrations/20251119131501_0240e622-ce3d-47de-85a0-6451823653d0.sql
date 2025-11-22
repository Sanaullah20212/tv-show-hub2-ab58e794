-- Create table for tracking user sessions and devices
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  ip_address TEXT NOT NULL,
  country TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  UNIQUE(user_id, device_fingerprint)
);

-- Create table for tracking login attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mobile_number TEXT,
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  country TEXT,
  city TEXT,
  attempt_type TEXT NOT NULL, -- 'success', 'blocked', 'suspicious'
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can insert sessions"
  ON public.user_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for login_attempts
CREATE POLICY "Users can view their own login attempts"
  ON public.login_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all login attempts"
  ON public.login_attempts
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can insert login attempts"
  ON public.login_attempts
  FOR INSERT
  WITH CHECK (true);

-- Create function to check suspicious login
CREATE OR REPLACE FUNCTION public.check_suspicious_login(
  p_user_id UUID,
  p_ip_address TEXT,
  p_country TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_country TEXT;
  v_last_login_time TIMESTAMP WITH TIME ZONE;
  v_time_diff INTERVAL;
BEGIN
  -- Get last successful login location and time
  SELECT country, created_at INTO v_last_country, v_last_login_time
  FROM public.login_attempts
  WHERE user_id = p_user_id 
    AND attempt_type = 'success'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no previous login, not suspicious
  IF v_last_country IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculate time difference
  v_time_diff := now() - v_last_login_time;
  
  -- If different country and login within 1 hour, suspicious
  IF v_last_country != p_country AND v_time_diff < INTERVAL '1 hour' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create index for performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_login_attempts_user_id ON public.login_attempts(user_id);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at DESC);