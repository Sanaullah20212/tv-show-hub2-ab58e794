-- Drop the existing policy
DROP POLICY IF EXISTS "Business users with active subscription can view zip passwords" ON zip_passwords;

-- Create new policy that checks subscription start date
CREATE POLICY "Business users can view passwords from subscription start date"
ON zip_passwords FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    JOIN subscriptions s ON s.user_id = p.user_id
    WHERE p.user_id = auth.uid()
      AND p.user_type = 'business'
      AND s.status = 'active'
      AND s.end_date > now()
      AND zip_passwords.created_at >= s.start_date
    ORDER BY s.start_date DESC
    LIMIT 1
  )
);

-- Keep admin policy unchanged
-- Admins can manage zip passwords (already exists)