-- Cendrixa: UK HR Compliance SaaS - Initial Schema
-- Multi-tenant with RLS, audit trail on all compliance actions

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE company_sector AS ENUM (
  'care_homes',
  'hospitality',
  'recruitment',
  'construction',
  'retail',
  'professional_services',
  'manufacturing',
  'education',
  'other'
);

CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'viewer');
CREATE TYPE compliance_status AS ENUM ('compliant', 'at_risk', 'non_compliant');
CREATE TYPE rtw_document_type AS ENUM (
  'passport', 'biometric_residence_permit', 'share_code',
  'birth_certificate', 'travel_document', 'visa', 'other'
);
CREATE TYPE rtw_check_status AS ENUM ('valid', 'expiring_soon', 'expired', 'pending_review');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'fixed_term', 'zero_hours', 'contractor');
CREATE TYPE case_type AS ENUM ('disciplinary', 'grievance');
CREATE TYPE case_status AS ENUM ('open', 'investigation', 'hearing', 'appeal', 'closed');
CREATE TYPE case_outcome AS ENUM (
  'no_action', 'verbal_warning', 'first_written_warning',
  'final_written_warning', 'dismissal', 'upheld', 'partially_upheld', 'not_upheld'
);
CREATE TYPE policy_status AS ENUM ('draft', 'active', 'archived', 'needs_review');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'view', 'export', 'approve', 'reject', 'complete_step'
);

-- ============================================
-- COMPANIES (tenants)
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector company_sector NOT NULL DEFAULT 'other',
  employee_count_range TEXT NOT NULL DEFAULT '1-10',
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  phone TEXT,
  website TEXT,
  -- Subscription
  subscription_tier subscription_tier NOT NULL DEFAULT 'starter',
  subscription_status subscription_status NOT NULL DEFAULT 'trialing',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  -- Compliance
  overall_compliance_status compliance_status NOT NULL DEFAULT 'at_risk',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMPANY MEMBERS (users linked to companies)
-- ============================================

CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'viewer',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- ============================================
-- EMPLOYEES
-- ============================================

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  start_date DATE NOT NULL,
  end_date DATE,
  probation_end_date DATE,
  weekly_hours NUMERIC(5,2) DEFAULT 40,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Holiday
  holiday_entitlement_days NUMERIC(5,2) NOT NULL DEFAULT 28,
  holiday_days_used NUMERIC(5,2) NOT NULL DEFAULT 0,
  holiday_year_start DATE,
  -- Compliance
  rtw_status rtw_check_status NOT NULL DEFAULT 'pending_review',
  contract_status compliance_status NOT NULL DEFAULT 'at_risk',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_active ON employees(company_id, is_active);

-- ============================================
-- RIGHT TO WORK CHECKS
-- ============================================

CREATE TABLE rtw_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type rtw_document_type NOT NULL,
  document_reference TEXT,
  share_code TEXT,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status rtw_check_status NOT NULL DEFAULT 'valid',
  checked_by UUID REFERENCES auth.users(id),
  notes TEXT,
  document_url TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rtw_checks_employee ON rtw_checks(employee_id);
CREATE INDEX idx_rtw_checks_expiry ON rtw_checks(expiry_date) WHERE status != 'expired';

-- ============================================
-- CONTRACTS
-- ============================================

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  contract_type employment_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  renewal_date DATE,
  probation_end_date DATE,
  weekly_hours NUMERIC(5,2),
  salary_amount NUMERIC(10,2),
  salary_currency TEXT DEFAULT 'GBP',
  document_url TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_employee ON contracts(employee_id);
CREATE INDEX idx_contracts_renewal ON contracts(renewal_date) WHERE is_current = true;

-- ============================================
-- POLICY TEMPLATES (master library)
-- ============================================

CREATE TABLE policy_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  applicable_sectors company_sector[] DEFAULT '{}',
  min_employees INT DEFAULT 1,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT '1.0',
  effective_date DATE,
  last_legal_review DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMPANY POLICIES (adopted from templates)
-- ============================================

CREATE TABLE company_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES policy_templates(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status policy_status NOT NULL DEFAULT 'draft',
  version TEXT NOT NULL DEFAULT '1.0',
  adopted_date DATE,
  review_date DATE,
  approved_by UUID REFERENCES auth.users(id),
  needs_update BOOLEAN NOT NULL DEFAULT false,
  update_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_policies_company ON company_policies(company_id);

-- ============================================
-- DISCIPLINARY & GRIEVANCE CASES
-- ============================================

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  case_type case_type NOT NULL,
  case_reference TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status case_status NOT NULL DEFAULT 'open',
  outcome case_outcome,
  opened_date DATE NOT NULL DEFAULT CURRENT_DATE,
  closed_date DATE,
  opened_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cases_company ON cases(company_id);
CREATE INDEX idx_cases_employee ON cases(employee_id);

-- ============================================
-- CASE STEPS (workflow steps within a case)
-- ============================================

CREATE TABLE case_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_case_steps_case ON case_steps(case_id);

-- ============================================
-- CASE DOCUMENTS (letters, notes, evidence)
-- ============================================

CREATE TABLE case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  step_id UUID REFERENCES case_steps(id),
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  content TEXT,
  document_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LEGAL ALERTS
-- ============================================

CREATE TABLE legal_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT,
  severity alert_severity NOT NULL DEFAULT 'info',
  effective_date DATE,
  affected_sectors company_sector[] DEFAULT '{}',
  affected_policy_categories TEXT[] DEFAULT '{}',
  source_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMPANY ALERT ACKNOWLEDGEMENTS
-- ============================================

CREATE TABLE alert_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES legal_alerts(id) ON DELETE CASCADE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_taken TEXT,
  UNIQUE(company_id, alert_id)
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON company_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON rtw_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON company_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON case_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rtw_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- policy_templates and legal_alerts are public read

-- Helper function: get user's company IDs
CREATE OR REPLACE FUNCTION get_user_company_ids()
RETURNS SETOF UUID AS $$
  SELECT company_id FROM company_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user has role in company
CREATE OR REPLACE FUNCTION user_has_role(target_company_id UUID, allowed_roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_members
    WHERE user_id = auth.uid()
    AND company_id = target_company_id
    AND role = ANY(allowed_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- COMPANIES
CREATE POLICY "Users can view their companies" ON companies
  FOR SELECT USING (id IN (SELECT get_user_company_ids()));
CREATE POLICY "Owners can update their companies" ON companies
  FOR UPDATE USING (user_has_role(id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- COMPANY MEMBERS
CREATE POLICY "Members can view co-members" ON company_members
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids()));
CREATE POLICY "Owners/admins can manage members" ON company_members
  FOR ALL USING (user_has_role(company_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- EMPLOYEES
CREATE POLICY "Members can view employees" ON employees
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids()));
CREATE POLICY "Admins+ can manage employees" ON employees
  FOR ALL USING (user_has_role(company_id, ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role]));

-- RTW CHECKS
CREATE POLICY "Members can view RTW checks" ON rtw_checks
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids()));
CREATE POLICY "Admins+ can manage RTW checks" ON rtw_checks
  FOR ALL USING (user_has_role(company_id, ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role]));

-- CONTRACTS
CREATE POLICY "Members can view contracts" ON contracts
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids()));
CREATE POLICY "Admins+ can manage contracts" ON contracts
  FOR ALL USING (user_has_role(company_id, ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role]));

-- COMPANY POLICIES
CREATE POLICY "Members can view policies" ON company_policies
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids()));
CREATE POLICY "Admins+ can manage policies" ON company_policies
  FOR ALL USING (user_has_role(company_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- CASES
CREATE POLICY "Members can view cases" ON cases
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids()));
CREATE POLICY "Admins+ can manage cases" ON cases
  FOR ALL USING (user_has_role(company_id, ARRAY['owner'::user_role, 'admin'::user_role, 'manager'::user_role]));

-- CASE STEPS
CREATE POLICY "Members can view case steps" ON case_steps
  FOR SELECT USING (case_id IN (SELECT id FROM cases WHERE company_id IN (SELECT get_user_company_ids())));
CREATE POLICY "Admins+ can manage case steps" ON case_steps
  FOR ALL USING (case_id IN (SELECT id FROM cases WHERE company_id IN (SELECT get_user_company_ids())));

-- CASE DOCUMENTS
CREATE POLICY "Members can view case documents" ON case_documents
  FOR SELECT USING (case_id IN (SELECT id FROM cases WHERE company_id IN (SELECT get_user_company_ids())));
CREATE POLICY "Admins+ can manage case documents" ON case_documents
  FOR ALL USING (case_id IN (SELECT id FROM cases WHERE company_id IN (SELECT get_user_company_ids())));

-- ALERT ACKNOWLEDGEMENTS
CREATE POLICY "Members can view acknowledgements" ON alert_acknowledgements
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids()));
CREATE POLICY "Admins+ can manage acknowledgements" ON alert_acknowledgements
  FOR ALL USING (user_has_role(company_id, ARRAY['owner'::user_role, 'admin'::user_role]));

-- AUDIT LOGS (read-only for members, insert via service role or functions)
CREATE POLICY "Members can view audit logs" ON audit_logs
  FOR SELECT USING (company_id IN (SELECT get_user_company_ids()));
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (company_id IN (SELECT get_user_company_ids()));

-- POLICY TEMPLATES (public read)
ALTER TABLE policy_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view templates" ON policy_templates
  FOR SELECT USING (true);

-- LEGAL ALERTS (public read)
ALTER TABLE legal_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view alerts" ON legal_alerts
  FOR SELECT USING (true);
