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

export async function createContract(formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyId();

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
