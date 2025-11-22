-- Remove the insecure user_credentials table
-- This table stored raw passwords which is a serious security vulnerability
DROP TABLE IF EXISTS public.user_credentials CASCADE;