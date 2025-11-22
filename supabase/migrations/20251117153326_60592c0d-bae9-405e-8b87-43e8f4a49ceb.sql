-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "Business users can view passwords from subscription start date" ON zip_passwords;

-- Create corrected policy that properly checks subscription start date
CREATE POLICY "Business users can view passwords from subscription start date"
ON zip_passwords FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.user_type = 'business'
  )
  AND zip_passwords.created_at >= (
    SELECT s.start_date
    FROM subscriptions s
    WHERE s.user_id = auth.uid()
      AND s.status = 'active'
      AND s.end_date > now()
    ORDER BY s.start_date DESC
    LIMIT 1
  )
);