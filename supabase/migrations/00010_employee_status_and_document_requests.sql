-- ============================================================
-- Employee Status & Document Requests
-- ============================================================

-- 1. New ENUMs
-- ============================================================

CREATE TYPE employee_status AS ENUM (
  'active',
  'on_probation',
  'on_leave',
  'suspended',
  'terminated'
);

CREATE TYPE doc_request_status AS ENUM (
  'pending',
  'complete',
  'expired'
);

CREATE TYPE doc_request_item_status AS ENUM (
  'pending',
  'uploaded'
);

CREATE TYPE doc_request_document_type AS ENUM (
  'passport',
  'brp',
  'share_code',
  'ni_letter',
  'proof_of_address',
  'bank_statement',
  'birth_certificate',
  'visa',
  'other'
);

-- ============================================================
-- 2. Alter existing tables
-- ============================================================

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS status employee_status NOT NULL DEFAULT 'active';

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- ============================================================
-- 3. document_requests table
-- ============================================================

CREATE TABLE document_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id      UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  message          TEXT,
  deadline         DATE NOT NULL,
  token            UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  token_expires_at TIMESTAMPTZ NOT NULL,
  status           doc_request_status NOT NULL DEFAULT 'pending',
  created_by       UUID REFERENCES company_members(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_requests_employee_id ON document_requests (employee_id);
CREATE INDEX idx_document_requests_company_id ON document_requests (company_id);

-- ============================================================
-- 4. document_request_items table
-- ============================================================

CREATE TABLE document_request_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     UUID NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  document_type  doc_request_document_type NOT NULL DEFAULT 'other',
  custom_label   TEXT,
  notes          TEXT,
  file_path      TEXT,
  file_name      TEXT,
  uploaded_at    TIMESTAMPTZ,
  status         doc_request_item_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_request_items_request_id ON document_request_items (request_id);

-- ============================================================
-- 5. updated_at triggers
-- ============================================================

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON document_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON document_request_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. RLS: document_requests
-- ============================================================

ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view document requests"
  ON document_requests FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM company_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Company managers can create document requests"
  ON document_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Company managers can update document requests"
  ON document_requests FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- ============================================================
-- 7. RLS: document_request_items
-- ============================================================

ALTER TABLE document_request_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view document request items"
  ON document_request_items FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT dr.id FROM document_requests dr
      JOIN company_members cm ON cm.company_id = dr.company_id
      WHERE cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Company managers can create document request items"
  ON document_request_items FOR INSERT
  TO authenticated
  WITH CHECK (
    request_id IN (
      SELECT dr.id FROM document_requests dr
      JOIN company_members cm ON cm.company_id = dr.company_id
      WHERE cm.user_id = auth.uid() AND cm.role IN ('owner', 'admin', 'manager')
    )
  );

-- Note: Unauthenticated uploads use the service_role client in the API route.
-- No anon policies are needed — consistent with the contract signing pattern.
