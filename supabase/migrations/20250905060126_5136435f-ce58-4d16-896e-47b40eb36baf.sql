-- Enable leaked password protection for better security
-- This helps prevent users from using commonly leaked passwords
ALTER SYSTEM SET auth.password_leaks_protection = 'on';

-- Force reload of configuration
SELECT pg_reload_conf();