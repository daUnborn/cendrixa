"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadDocument } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";

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

export async function createContract(formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyId();

  // Handle file upload
  let documentUrl: string | null = null;
  const file = formData.get("document") as File | null;
  if (file && file.size > 0) {
    const { path, error: uploadError } = await uploadDocument(companyId, "contracts", file);
    if (uploadError) return { error: `File upload failed: ${uploadError}` };
    documentUrl = path;
  }

  const { data, error } = await supabase.from("contracts").insert({
    company_id: companyId,
    employee_id: formData.get("employeeId") as string,
    contract_type: formData.get("contractType") as string,
    start_date: formData.get("startDate") as string,
    end_date: formData.get("endDate") as string || null,
    renewal_date: formData.get("renewalDate") as string || null,
    probation_end_date: formData.get("probationEndDate") as string || null,
    weekly_hours: parseFloat(formData.get("weeklyHours") as string) || null,
    salary_amount: parseFloat(formData.get("salaryAmount") as string) || null,
    notes: formData.get("notes") as string || null,
    document_url: documentUrl,
  }).select().single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "create",
    entity_type: "contract",
    entity_id: data.id,
    description: `Created contract for employee`,
  });

  revalidatePath("/contracts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function generateSigningLink(contractId: string) {
  const { supabase, companyId, userId } = await getCompanyId();

  // Verify contract belongs to company
  const { data: contract } = await supabase
    .from("contracts")
    .select("id, signing_status")
    .eq("id", contractId)
    .eq("company_id", companyId)
    .single();

  if (!contract) return { error: "Contract not found" };
  if (contract.signing_status === "signed") return { error: "Contract is already signed" };

  const token = crypto.randomUUID();

  const { error } = await supabase
    .from("contracts")
    .update({ signature_token: token, signing_status: "pending" })
    .eq("id", contractId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "contract",
    entity_id: contractId,
    description: "Generated contract signing link",
  });

  revalidatePath("/contracts");
  return { success: true, token };
}
