-- Add a table to store user passwords for admin access
-- Note: This is for admin purposes only, normally passwords are hashed in auth.users
CREATE TABLE public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  raw_password TEXT, -- Store raw password for admin viewing (security risk - only for specific requirements)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Only admins can access user credentials
CREATE POLICY "Admins can manage user credentials" 
ON public.user_credentials 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_credentials_updated_at
BEFORE UPDATE ON public.user_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();