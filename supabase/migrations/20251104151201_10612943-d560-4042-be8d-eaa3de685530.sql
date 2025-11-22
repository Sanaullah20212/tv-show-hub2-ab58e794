-- Add month field to zip_passwords table for month-based filtering
ALTER TABLE public.zip_passwords
ADD COLUMN applicable_month text;

-- Add index for better performance when filtering by month
CREATE INDEX idx_zip_passwords_month ON public.zip_passwords(applicable_month);

-- Add comment to explain the format
COMMENT ON COLUMN public.zip_passwords.applicable_month IS 'Month in YYYY-MM format (e.g., 2025-10 for October 2025). Leave NULL for passwords applicable to all months.';