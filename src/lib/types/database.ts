export type CompanySector =
  | "care_homes"
  | "hospitality"
  | "recruitment"
  | "construction"
  | "retail"
  | "professional_services"
  | "manufacturing"
  | "education"
  | "other";

export type SubscriptionTier = "starter" | "professional" | "enterprise";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid";
export type UserRole = "owner" | "admin" | "manager" | "viewer";
export type ComplianceStatus = "compliant" | "at_risk" | "non_compliant";
export type RtwDocumentType =
  | "passport"
  | "biometric_residence_permit"
  | "share_code"
  | "birth_certificate"
  | "travel_document"
  | "visa"
  | "other";
export type RtwCheckStatus = "valid" | "expiring_soon" | "expired" | "pending_review";
export type EmploymentType = "full_time" | "part_time" | "fixed_term" | "zero_hours" | "contractor";
export type CaseType = "disciplinary" | "grievance";
export type CaseStatus = "open" | "investigation" | "hearing" | "appeal" | "closed";
export type CaseOutcome =
  | "no_action"
  | "verbal_warning"
  | "first_written_warning"
  | "final_written_warning"
  | "dismissal"
  | "upheld"
  | "partially_upheld"
  | "not_upheld";
export type PolicyStatus = "draft" | "active" | "archived" | "needs_review";
export type AlertSeverity = "info" | "warning" | "critical";
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "export"
  | "approve"
  | "reject"
  | "complete_step";

// Row types
export interface Company {
  id: string;
  name: string;
  sector: CompanySector;
  employee_count_range: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  phone: string | null;
  website: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  overall_compliance_status: ComplianceStatus;
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  job_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  department: string | null;
  employment_type: EmploymentType;
  start_date: string;
  end_date: string | null;
  probation_end_date: string | null;
  weekly_hours: number;
  is_active: boolean;
  holiday_entitlement_days: number;
  holiday_days_used: number;
  holiday_year_start: string | null;
  rtw_status: RtwCheckStatus;
  contract_status: ComplianceStatus;
  created_at: string;
  updated_at: string;
}

export interface RtwCheck {
  id: string;
  company_id: string;
  employee_id: string;
  document_type: RtwDocumentType;
  document_reference: string | null;
  share_code: string | null;
  check_date: string;
  expiry_date: string | null;
  status: RtwCheckStatus;
  checked_by: string | null;
  notes: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export type SigningStatus = "unsigned" | "pending" | "signed";

export interface Contract {
  id: string;
  company_id: string;
  employee_id: string;
  contract_type: EmploymentType;
  start_date: string;
  end_date: string | null;
  renewal_date: string | null;
  probation_end_date: string | null;
  weekly_hours: number | null;
  salary_amount: number | null;
  salary_currency: string;
  document_url: string | null;
  is_current: boolean;
  notes: string | null;
  signature_token: string | null;
  signed_at: string | null;
  signature_data: string | null;
  signer_name: string | null;
  signer_ip: string | null;
  signing_status: SigningStatus;
  created_at: string;
  updated_at: string;
}

export interface PolicyTemplate {
  id: string;
  title: string;
  category: string;
  description: string | null;
  content: string;
  applicable_sectors: CompanySector[];
  min_employees: number;
  is_mandatory: boolean;
  version: string;
  effective_date: string | null;
  last_legal_review: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyPolicy {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  category: string;
  status: PolicyStatus;
  version: string;
  review_date: string | null;
  approved_by: string | null;
  access_token: string | null;
  requires_acknowledgement: boolean;
  activated_at: string | null;
  activated_by: string | null;
  archived_at: string | null;
  archived_by: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyAcknowledgement {
  id: string;
  policy_id: string;
  company_id: string;
  employee_id: string | null;
  signer_name: string;
  signer_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  acknowledged_at: string;
}

export interface Case {
  id: string;
  company_id: string;
  employee_id: string;
  case_type: CaseType;
  case_reference: string;
  subject: string;
  description: string | null;
  status: CaseStatus;
  outcome: CaseOutcome | null;
  opened_date: string;
  closed_date: string | null;
  opened_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStep {
  id: string;
  case_id: string;
  step_number: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  step_id: string | null;
  title: string;
  document_type: string;
  content: string | null;
  document_url: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface LegalAlert {
  id: string;
  title: string;
  summary: string;
  detail: string | null;
  severity: AlertSeverity;
  effective_date: string | null;
  affected_sectors: CompanySector[];
  affected_policy_categories: string[];
  source_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AlertAcknowledgement {
  id: string;
  company_id: string;
  alert_id: string;
  acknowledged_by: string | null;
  acknowledged_at: string;
  action_taken: string | null;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  description: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// Supabase table helper type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Table<R> = {
  Row: R;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: never[];
};

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      companies: Table<Company>;
      company_members: Table<CompanyMember>;
      employees: Table<Employee>;
      rtw_checks: Table<RtwCheck>;
      contracts: Table<Contract>;
      policy_templates: Table<PolicyTemplate>;
      company_policies: Table<CompanyPolicy>;
      policy_acknowledgements: Table<PolicyAcknowledgement>;
      cases: Table<Case>;
      case_steps: Table<CaseStep>;
      case_documents: Table<CaseDocument>;
      legal_alerts: Table<LegalAlert>;
      alert_acknowledgements: Table<AlertAcknowledgement>;
      audit_logs: Table<AuditLog>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      company_sector: CompanySector;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      user_role: UserRole;
      compliance_status: ComplianceStatus;
      rtw_document_type: RtwDocumentType;
      rtw_check_status: RtwCheckStatus;
      employment_type: EmploymentType;
      case_type: CaseType;
      case_status: CaseStatus;
      case_outcome: CaseOutcome;
      policy_status: PolicyStatus;
      alert_severity: AlertSeverity;
      audit_action: AuditAction;
    };
    CompositeTypes: Record<string, never>;
  };
}
