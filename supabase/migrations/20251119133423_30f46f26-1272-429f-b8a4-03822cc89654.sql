-- Update admin user approval status to approved
UPDATE profiles 
SET 
  approval_status = 'approved',
  approved_at = now()
WHERE role = 'admin' 
  AND approval_status != 'approved';

-- Ensure all admin users are always approved automatically
CREATE OR REPLACE FUNCTION auto_approve_admin_users()
RETURNS TRIGGER AS $$
BEGIN
  -- If user role is admin, automatically approve
  IF NEW.role = 'admin' THEN
    NEW.approval_status := 'approved';
    NEW.approved_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-approving admins on INSERT
DROP TRIGGER IF EXISTS trigger_auto_approve_admin_on_insert ON profiles;
CREATE TRIGGER trigger_auto_approve_admin_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_admin_users();

-- Create trigger for auto-approving admins on UPDATE (when role changes to admin)
DROP TRIGGER IF EXISTS trigger_auto_approve_admin_on_update ON profiles;
CREATE TRIGGER trigger_auto_approve_admin_on_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'admin' AND OLD.role != 'admin')
  EXECUTE FUNCTION auto_approve_admin_users();