-- Drop the existing restrictive RLS policy for business users
DROP POLICY IF EXISTS "Business users can view passwords from subscription start date" ON zip_passwords;

-- Create a new, more flexible RLS policy for business users
-- This policy allows business users to see passwords that:
-- 1. Have no applicable_month (apply to all subscriptions)
-- 2. Have an applicable_month that falls within their subscription period
CREATE POLICY "Business users can view passwords within subscription period"
ON zip_passwords
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'business'::user_type
  )
  AND (
    -- Either password has no specific month (applies to all)
    applicable_month IS NULL
    OR
    -- Or password's month falls within active/pending subscription period
    EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.status IN ('active', 'pending')
      AND s.end_date >= now()
      AND (
        -- Check if applicable_month is within subscription range
        applicable_month >= to_char(s.start_date, 'YYYY-MM')
        AND applicable_month <= to_char(s.end_date, 'YYYY-MM')
      )
      ORDER BY s.created_at DESC
      LIMIT 1
    )
  )
);