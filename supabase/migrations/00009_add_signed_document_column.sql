-- Add columns for signed document tracking and link delivery
ALTER TABLE contracts
ADD COLUMN signed_document_url TEXT,
ADD COLUMN link_sent_at TIMESTAMPTZ,
ADD COLUMN link_sent_via TEXT CHECK (link_sent_via IN ('email', 'sms', 'both', 'manual'));

-- Add indexes for faster lookups
CREATE INDEX idx_contracts_signed_document ON contracts(signed_document_url);
CREATE INDEX idx_contracts_link_sent ON contracts(link_sent_at);

-- Add comments for documentation
COMMENT ON COLUMN contracts.signed_document_url IS
'Path to the signed PDF (with embedded signature) in Supabase Storage';

COMMENT ON COLUMN contracts.link_sent_at IS
'Timestamp when the signing link was sent to the employee';

COMMENT ON COLUMN contracts.link_sent_via IS
'How the signing link was delivered: email, sms, both, or manual (copy/paste)';
