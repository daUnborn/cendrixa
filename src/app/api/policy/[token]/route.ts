import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: policy, error } = await supabase
    .from("company_policies")
    .select("id, title, description, category, version, file_path, requires_acknowledgement, company_id, companies(name)")
    .eq("access_token", token)
    .eq("status", "active")
    .single();

  if (error || !policy) {
    return NextResponse.json(
      { error: "Policy not found or no longer available" },
      { status: 404 }
    );
  }

  // Generate signed URL for PDF
  let documentUrl: string | null = null;
  if (policy.file_path) {
    const { data } = await supabase.storage
      .from("company-documents")
      .createSignedUrl(policy.file_path, 3600);
    documentUrl = data?.signedUrl ?? null;
  }

  // Get employee list for acknowledgement dropdown
  let employees: { id: string; name: string }[] = [];
  if (policy.requires_acknowledgement) {
    const { data: emps } = await supabase
      .from("employees")
      .select("id, first_name, last_name")
      .eq("company_id", policy.company_id)
      .eq("is_active", true)
      .order("first_name");

    employees = (emps ?? []).map((e) => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
    }));

    // Check which employees have already acknowledged
    const { data: acks } = await supabase
      .from("policy_acknowledgements")
      .select("employee_id")
      .eq("policy_id", policy.id);

    const acknowledgedIds = new Set((acks ?? []).map((a) => a.employee_id));
    employees = employees.map((e) => ({
      ...e,
      acknowledged: acknowledgedIds.has(e.id),
    }));
  }

  const company = policy.companies as unknown as { name: string } | null;

  return NextResponse.json({
    id: policy.id,
    title: policy.title,
    description: policy.description,
    category: policy.category,
    version: policy.version,
    companyName: company?.name ?? "Unknown",
    requiresAcknowledgement: policy.requires_acknowledgement,
    documentUrl,
    employees,
  });
}
