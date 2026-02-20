"use server";

import { createClient } from "@/lib/supabase/server";
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

export async function createRtwCheck(formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyId();

  const expiryDate = formData.get("expiryDate") as string;
  let status = "valid";
  if (expiryDate) {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (expiry < now) status = "expired";
    else if (expiry < thirtyDays) status = "expiring_soon";
  }

  const { data, error } = await supabase.from("rtw_checks").insert({
    company_id: companyId,
    employee_id: formData.get("employeeId") as string,
    document_type: formData.get("documentType") as string,
    document_reference: formData.get("documentReference") as string || null,
    share_code: formData.get("shareCode") as string || null,
    check_date: formData.get("checkDate") as string || new Date().toISOString().split("T")[0],
    expiry_date: expiryDate || null,
    status,
    checked_by: userId,
    notes: formData.get("notes") as string || null,
  }).select().single();

  if (error) return { error: error.message };

  // Update employee RTW status
  await supabase.from("employees").update({ rtw_status: status }).eq("id", formData.get("employeeId") as string);

  // Audit log
  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "create",
    entity_type: "rtw_check",
    entity_id: data.id,
    description: `Recorded right-to-work check for employee`,
  });

  revalidatePath("/rtw");
  revalidatePath("/employees");
  revalidatePath("/dashboard");
  return { success: true };
}
