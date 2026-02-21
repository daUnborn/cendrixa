-- Migration: Document Upload & Contract Signing
-- Adds contract signing columns and sets up storage bucket for documents

-- ============================================================
-- 1. Add signing columns to contracts table
-- ============================================================
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS signature_token UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signature_data TEXT,
  ADD COLUMN IF NOT EXISTS signer_name TEXT,
  ADD COLUMN IF NOT EXISTS signer_ip TEXT,
  ADD COLUMN IF NOT EXISTS signing_status TEXT NOT NULL DEFAULT 'unsigned'
    CHECK (signing_status IN ('unsigned', 'pending', 'signed'));

CREATE INDEX IF NOT EXISTS idx_contracts_signature_token
  ON contracts (signature_token) WHERE signature_token IS NOT NULL;

-- ============================================================
-- 2. Create storage bucket for company documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-documents',
  'company-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Storage RLS policies
-- Company members can upload files to their company folder
-- ============================================================
CREATE POLICY "Company members can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-documents'
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can view documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'company-documents'
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT company_id FROM company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-documents'
    AND (storage.foldername(name))[1]::uuid IN (
      SELECT cm.company_id FROM company_members cm
      WHERE cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );
