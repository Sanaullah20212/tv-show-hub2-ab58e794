-- Drop the existing policy
DROP POLICY IF EXISTS "Business users can view passwords within subscription period" ON zip_passwords;

-- Create updated policy that ensures business users only see passwords:
-- 1. Created AFTER their subscription start date
-- 2. With applicable_month within their subscription period (or no applicable_month)
CREATE POLICY "Business users can view passwords from subscription start"
ON zip_passwords
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'business'::user_type
  )
  AND EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status IN ('active', 'pending')
    AND s.end_date >= now()
    -- Critical: Password must be created AFTER subscription starts
    AND zip_passwords.created_at >= s.start_date
    -- Also check if applicable_month is within subscription period (or NULL for all)
    AND (
      zip_passwords.applicable_month IS NULL
      OR (
        zip_passwords.applicable_month >= to_char(s.start_date, 'YYYY-MM')
        AND zip_passwords.applicable_month <= to_char(s.end_date, 'YYYY-MM')
      )
    )
    ORDER BY s.created_at DESC
    LIMIT 1
  )
);