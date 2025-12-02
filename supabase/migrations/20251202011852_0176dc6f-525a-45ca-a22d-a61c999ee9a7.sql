-- Create payment methods table for admin configuration
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  method_key TEXT NOT NULL UNIQUE, -- 'bkash', 'nagad', 'rocket', 'upi', 'bank'
  display_name TEXT NOT NULL,
  display_name_bangla TEXT NOT NULL,
  account_number TEXT,
  instructions TEXT,
  instructions_bangla TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO public.payment_methods (method_key, display_name, display_name_bangla, account_number, instructions, instructions_bangla, sort_order) VALUES
  ('bkash', 'bKash', 'বিকাশ', '01637792810', 'Send Money or Cash In to the number', 'নম্বরে সেন্ড মানি অথবা ক্যাশ ইন করুন', 1),
  ('nagad', 'Nagad', 'নগদ', '01637792810', 'Send Money or Cash In to the number', 'নম্বরে সেন্ড মানি অথবা ক্যাশ ইন করুন', 2),
  ('rocket', 'Rocket', 'রকেট', '01637792810', 'Send Money or Cash In to the number', 'নম্বরে সেন্ড মানি অথবা ক্যাশ ইন করুন', 3),
  ('upi', 'UPI', 'ইউপিআই', 'example@upi', 'Send payment to UPI ID', 'ইউপিআই আইডিতে পেমেন্ট পাঠান', 4),
  ('bank', 'Bank Transfer', 'বিকাশ ব্যাংক ট্রান্সফার', '', 'Contact admin for bank details', 'ব্যাংক বিবরণের জন্য এডমিনের সাথে যোগাযোগ করুন', 5);

-- RLS Policies
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Anyone can view active payment methods
CREATE POLICY "Anyone can view active payment methods"
  ON public.payment_methods
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage payment methods
CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Trigger to update updated_at
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();