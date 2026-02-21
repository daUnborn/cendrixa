-- Migration: Policy Upload & Acknowledgement Tracking
-- Pivots company_policies from template-based adoption to file-upload model

-- 1. ALTER company_policies: add new columns
ALTER TABLE company_policies
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS access_token UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS requires_acknowledgement BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id);

-- 2. Drop old template-based columns
ALTER TABLE company_policies
  DROP COLUMN IF EXISTS template_id,
  DROP COLUMN IF EXISTS content,
  DROP COLUMN IF EXISTS needs_update,
  DROP COLUMN IF EXISTS update_reason,
  DROP COLUMN IF EXISTS adopted_date;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_company_policies_access_token
  ON company_policies (access_token) WHERE access_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_company_policies_company_status
  ON company_policies (company_id, status);

-- 4. CREATE policy_acknowledgements table
CREATE TABLE IF NOT EXISTS policy_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES company_policies(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one acknowledgement per employee per policy
CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_ack_unique_employee
  ON policy_acknowledgements (policy_id, employee_id) WHERE employee_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_policy_ack_policy
  ON policy_acknowledgements (policy_id);

CREATE INDEX IF NOT EXISTS idx_policy_ack_company
  ON policy_acknowledgements (company_id);

-- 5. RLS for policy_acknowledgements
ALTER TABLE policy_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Company members can view acknowledgements for their company
CREATE POLICY "Members can view policy acknowledgements"
  ON policy_acknowledgements FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

-- No authenticated INSERT policy — service-role handles public submissions
