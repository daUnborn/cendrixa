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

export async function createEmployee(formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyId();

  const { data, error } = await supabase.from("employees").insert({
    company_id: companyId,
    first_name: formData.get("firstName") as string,
    last_name: formData.get("lastName") as string,
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    job_title: formData.get("jobTitle") as string || null,
    department: formData.get("department") as string || null,
    employment_type: formData.get("employmentType") as string || "full_time",
    start_date: formData.get("startDate") as string,
    weekly_hours: parseFloat(formData.get("weeklyHours") as string) || 40,
  }).select().single();

  if (error) return { error: error.message };

  // Audit log
  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "create",
    entity_type: "employee",
    entity_id: data.id,
    description: `Added employee ${data.first_name} ${data.last_name}`,
  });

  revalidatePath("/employees");
  revalidatePath("/dashboard");
  return { success: true, data };
}

export async function updateEmployee(id: string, formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyId();

  const { error } = await supabase.from("employees").update({
    first_name: formData.get("firstName") as string,
    last_name: formData.get("lastName") as string,
    email: formData.get("email") as string || null,
    phone: formData.get("phone") as string || null,
    job_title: formData.get("jobTitle") as string || null,
    department: formData.get("department") as string || null,
    employment_type: formData.get("employmentType") as string,
    weekly_hours: parseFloat(formData.get("weeklyHours") as string) || 40,
  }).eq("id", id).eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "employee",
    entity_id: id,
    description: `Updated employee details`,
  });

  revalidatePath("/employees");
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const { supabase, companyId, userId } = await getCompanyId();

  const { error } = await supabase.from("employees")
    .update({ is_active: false })
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "delete",
    entity_type: "employee",
    entity_id: id,
    description: `Deactivated employee`,
  });

  revalidatePath("/employees");
  revalidatePath("/dashboard");
  return { success: true };
}
