import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Look up policy by token
  const { data: policy, error: policyErr } = await supabase
    .from("company_policies")
    .select("id, company_id, status, requires_acknowledgement")
    .eq("access_token", token)
    .single();

  if (policyErr || !policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  if (policy.status !== "active") {
    return NextResponse.json({ error: "Policy is no longer active" }, { status: 400 });
  }

  if (!policy.requires_acknowledgement) {
    return NextResponse.json({ error: "This policy does not require acknowledgement" }, { status: 400 });
  }

  const body = await request.json();
  const { signerName, employeeId, signerEmail } = body;

  if (!signerName?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Check for duplicate acknowledgement
  if (employeeId) {
    const { data: existing } = await supabase
      .from("policy_acknowledgements")
      .select("id")
      .eq("policy_id", policy.id)
      .eq("employee_id", employeeId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Already acknowledged" }, { status: 409 });
    }
  }

  // Get IP and user agent
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const userAgent = request.headers.get("user-agent") || null;

  const { error: insertErr } = await supabase
    .from("policy_acknowledgements")
    .insert({
      policy_id: policy.id,
      company_id: policy.company_id,
      employee_id: employeeId || null,
      signer_name: signerName.trim(),
      signer_email: signerEmail?.trim() || null,
      ip_address: ip,
      user_agent: userAgent,
    });

  if (insertErr) {
    // Handle unique constraint violation
    if (insertErr.code === "23505") {
      return NextResponse.json({ error: "Already acknowledged" }, { status: 409 });
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    company_id: policy.company_id,
    user_id: null,
    action: "create",
    entity_type: "policy_acknowledgement",
    entity_id: policy.id,
    description: `Policy acknowledged by ${signerName.trim()}`,
    metadata: { ip_address: ip, employee_id: employeeId || null },
  });

  return NextResponse.json({ success: true });
}
