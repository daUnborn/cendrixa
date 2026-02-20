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

export async function adoptPolicy(templateId: string) {
  const { supabase, companyId, userId } = await getCompanyId();

  // Get template
  const { data: template, error: templateError } = await supabase
    .from("policy_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (templateError || !template) return { error: "Template not found" };

  const { data, error } = await supabase.from("company_policies").insert({
    company_id: companyId,
    template_id: templateId,
    title: template.title,
    content: template.content,
    status: "draft",
    version: template.version,
  }).select().single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "create",
    entity_type: "company_policy",
    entity_id: data.id,
    description: `Adopted policy template: ${template.title}`,
  });

  revalidatePath("/policies");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePolicyStatus(policyId: string, status: string) {
  const { supabase, companyId, userId } = await getCompanyId();

  const updates: Record<string, unknown> = { status };
  if (status === "active") {
    updates.adopted_date = new Date().toISOString().split("T")[0];
    updates.approved_by = userId;
  }

  const { error } = await supabase.from("company_policies")
    .update(updates)
    .eq("id", policyId)
    .eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "company_policy",
    entity_id: policyId,
    description: `Updated policy status to ${status}`,
  });

  revalidatePath("/policies");
  revalidatePath("/dashboard");
  return { success: true };
}
