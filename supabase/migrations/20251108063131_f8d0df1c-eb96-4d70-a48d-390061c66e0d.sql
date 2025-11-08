-- Step 1: Add new roles to enum (must be in separate transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';