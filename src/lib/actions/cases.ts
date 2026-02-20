"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const DISCIPLINARY_STEPS = [
  { step_number: 1, title: "Investigation", description: "Gather facts and evidence. Interview witnesses if needed." },
  { step_number: 2, title: "Notification Letter", description: "Write to employee outlining allegations and invite to hearing." },
  { step_number: 3, title: "Disciplinary Hearing", description: "Hold formal hearing. Employee may bring companion." },
  { step_number: 4, title: "Decision & Outcome", description: "Decide on outcome: no action, warning, or dismissal." },
  { step_number: 5, title: "Outcome Letter", description: "Confirm decision in writing with right of appeal." },
  { step_number: 6, title: "Appeal (if requested)", description: "Hear appeal with different manager if possible." },
];

const GRIEVANCE_STEPS = [
  { step_number: 1, title: "Written Grievance Received", description: "Employee submits formal grievance in writing." },
  { step_number: 2, title: "Acknowledge Receipt", description: "Acknowledge grievance within 5 working days." },
  { step_number: 3, title: "Investigation", description: "Investigate the grievance. Gather evidence." },
  { step_number: 4, title: "Grievance Meeting", description: "Hold formal meeting. Employee may bring companion." },
  { step_number: 5, title: "Decision & Response", description: "Communicate outcome in writing with right of appeal." },
  { step_number: 6, title: "Appeal (if requested)", description: "Hear appeal with different manager if possible." },
];

async function getCompanyId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();
  if (!member) throw new Error("No company found");
  return { supabase, companyId: member.company_id, userId: user.id };
}

export async function createCase(formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyId();

  const caseType = formData.get("caseType") as string;
  const caseRef = `${caseType === "disciplinary" ? "DIS" : "GRV"}-${Date.now().toString(36).toUpperCase()}`;

  const { data: newCase, error } = await supabase.from("cases").insert({
    company_id: companyId,
    employee_id: formData.get("employeeId") as string,
    case_type: caseType,
    case_reference: caseRef,
    subject: formData.get("subject") as string,
    description: formData.get("description") as string || null,
    opened_by: userId,
    assigned_to: userId,
  }).select().single();

  if (error) return { error: error.message };

  // Create workflow steps
  const steps = caseType === "disciplinary" ? DISCIPLINARY_STEPS : GRIEVANCE_STEPS;
  await supabase.from("case_steps").insert(
    steps.map((s) => ({
      case_id: newCase.id,
      ...s,
    }))
  );

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "create",
    entity_type: "case",
    entity_id: newCase.id,
    description: `Opened ${caseType} case: ${formData.get("subject")}`,
  });

  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return { success: true, caseId: newCase.id };
}

export async function completeStep(stepId: string, caseId: string, notes: string) {
  const { supabase, companyId, userId } = await getCompanyId();

  const { error } = await supabase.from("case_steps").update({
    is_completed: true,
    completed_at: new Date().toISOString(),
    completed_by: userId,
    notes,
  }).eq("id", stepId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "complete_step",
    entity_type: "case_step",
    entity_id: stepId,
    description: `Completed workflow step`,
    metadata: { case_id: caseId },
  });

  revalidatePath("/cases");
  return { success: true };
}

export async function closeCase(caseId: string, outcome: string) {
  const { supabase, companyId, userId } = await getCompanyId();

  const { error } = await supabase.from("cases").update({
    status: "closed",
    outcome,
    closed_date: new Date().toISOString().split("T")[0],
  }).eq("id", caseId).eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "case",
    entity_id: caseId,
    description: `Closed case with outcome: ${outcome.replace(/_/g, " ")}`,
  });

  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return { success: true };
}
