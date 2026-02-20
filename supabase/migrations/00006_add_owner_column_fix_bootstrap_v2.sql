-- ENTERPRISE-GRADE FIX: Add owner_id column to companies (v2)
--
-- This eliminates the circular dependency between companies and company_members
-- during onboarding by tracking ownership directly on the company row

-- Step 1: Add owner_id column (nullable first)
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Step 2: Populate owner_id for existing companies
-- Set owner_id to the first 'owner' role member for each company
UPDATE companies c
SET owner_id = (
  SELECT cm.user_id
  FROM company_members cm
  WHERE cm.company_id = c.id
    AND cm.role = 'owner'
  LIMIT 1
)
WHERE owner_id IS NULL;

-- Step 3: Delete orphaned companies (companies with no owner in company_members)
-- These were created during failed onboarding attempts
DELETE FROM companies
WHERE owner_id IS NULL;

-- Step 4: Now make owner_id NOT NULL with default
ALTER TABLE companies
ALTER COLUMN owner_id SET DEFAULT auth.uid();

ALTER TABLE companies
ALTER COLUMN owner_id SET NOT NULL;

-- Step 5: Update SELECT policy to use owner_id
DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies"
ON companies
FOR SELECT
TO authenticated
USING (
  -- User is the owner OR user is a member
  owner_id = auth.uid()
  OR
  id IN (SELECT get_user_company_ids())
);

-- Step 6: Update INSERT policy to set owner_id
DROP POLICY IF EXISTS "insert_companies_authenticated" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON companies;

CREATE POLICY "Users can create their own companies"
ON companies
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Step 7: Update UPDATE policy (keep existing logic but add owner check)
DROP POLICY IF EXISTS "Owners can update their companies" ON companies;

CREATE POLICY "Owners can update their companies"
ON companies
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  OR
  user_has_role(id, ARRAY['owner'::user_role, 'admin'::user_role])
);

-- Verify the changes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name = 'owner_id';

-- Show how many companies we have now
SELECT COUNT(*) as total_companies FROM companies;

-- Show all policies on companies table
SELECT
  policyname,
  cmd,
  roles::text[]
FROM pg_policies
WHERE tablename = 'companies'
ORDER BY cmd, policyname;
