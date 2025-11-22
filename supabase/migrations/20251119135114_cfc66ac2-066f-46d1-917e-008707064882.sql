-- Enable realtime for login_attempts and user_sessions tables
ALTER TABLE public.login_attempts REPLICA IDENTITY FULL;
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.login_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;