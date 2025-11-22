-- Fix handle_new_user function to correctly assign user roles
-- The issue: function was trying to cast user_type ('mobile'/'business') to user_role enum
-- This caused errors because user_role enum only has values like 'admin', 'user', 'moderator'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_count INTEGER;
    assigned_role user_role;
BEGIN
    -- Count existing profiles
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    -- If this is the first user, make them admin
    -- Otherwise, assign 'user' role by default
    IF user_count = 0 THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := 'user';
    END IF;

    -- Insert profile with correct role and user_type
    INSERT INTO public.profiles (user_id, mobile_number, user_type, role)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data ->> 'mobile_number',
        COALESCE((NEW.raw_user_meta_data ->> 'user_type')::user_type, 'mobile'),
        assigned_role
    );
    
    RETURN NEW;
END;
$function$;