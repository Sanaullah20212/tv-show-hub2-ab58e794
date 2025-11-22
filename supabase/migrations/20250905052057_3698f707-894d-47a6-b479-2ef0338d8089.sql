-- Add new enum values for subscription status
ALTER TYPE subscription_status ADD VALUE 'pending';
ALTER TYPE subscription_status ADD VALUE 'rejected';