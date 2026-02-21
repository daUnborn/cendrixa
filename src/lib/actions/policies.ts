"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadDocument } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";

async function getCompanyContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();
  if (!member) throw new Error("No company found");
  return { supabase, companyId: member.company_id, userId: user.id };
}

function revalidate() {
  revalidatePath("/policies");
  revalidatePath("/dashboard");
}

export async function uploadPolicy(formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyContext();

  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const category = (formData.get("category") as string) || "general";
  const version = (formData.get("version") as string) || "1.0";
  const reviewDate = (formData.get("reviewDate") as string) || null;
  const requiresAcknowledgement = formData.get("requiresAcknowledgement") === "true";

  if (!title?.trim()) return { error: "Title is required" };

  let filePath: string | null = null;
  let fileName: string | null = null;
  let fileSizeBytes: number | null = null;

  if (file && file.size > 0) {
    if (file.type !== "application/pdf") return { error: "Only PDF files are supported" };
    if (file.size > 10 * 1024 * 1024) return { error: "File must be under 10MB" };

    const result = await uploadDocument(companyId, "policies", file);
    if (result.error) return { error: result.error };

    filePath = result.path;
    fileName = file.name;
    fileSizeBytes = file.size;
  }

  const { data, error } = await supabase
    .from("company_policies")
    .insert({
      company_id: companyId,
      title: title.trim(),
      description,
      file_path: filePath,
      file_name: fileName,
      file_size_bytes: fileSizeBytes,
      category,
      status: "draft",
      version,
      review_date: reviewDate || null,
      requires_acknowledgement: requiresAcknowledgement,
      uploaded_by: userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "create",
    entity_type: "company_policy",
    entity_id: data.id,
    description: `Uploaded policy: ${title.trim()}`,
  });

  revalidate();
  return { success: true, policyId: data.id };
}

export async function activatePolicy(policyId: string) {
  const { supabase, companyId, userId } = await getCompanyContext();

  // Verify policy exists and is draft
  const { data: policy, error: fetchErr } = await supabase
    .from("company_policies")
    .select("id, status, file_path")
    .eq("id", policyId)
    .eq("company_id", companyId)
    .single();

  if (fetchErr || !policy) return { error: "Policy not found" };
  if (policy.status !== "draft") return { error: "Only draft policies can be activated" };
  if (!policy.file_path) return { error: "Upload a PDF before activating" };

  const { error } = await supabase
    .from("company_policies")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
      activated_by: userId,
      approved_by: userId,
    })
    .eq("id", policyId)
    .eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "approve",
    entity_type: "company_policy",
    entity_id: policyId,
    description: "Activated policy",
  });

  revalidate();
  return { success: true };
}

export async function archivePolicy(policyId: string) {
  const { supabase, companyId, userId } = await getCompanyContext();

  const { error } = await supabase
    .from("company_policies")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      archived_by: userId,
    })
    .eq("id", policyId)
    .eq("company_id", companyId)
    .eq("status", "active");

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "company_policy",
    entity_id: policyId,
    description: "Archived policy",
  });

  revalidate();
  return { success: true };
}

export async function deletePolicy(policyId: string) {
  const { supabase, companyId, userId } = await getCompanyContext();

  // Only allow deleting draft policies
  const { data: policy, error: fetchErr } = await supabase
    .from("company_policies")
    .select("id, status, file_path")
    .eq("id", policyId)
    .eq("company_id", companyId)
    .single();

  if (fetchErr || !policy) return { error: "Policy not found" };
  if (policy.status !== "draft") return { error: "Only draft policies can be deleted" };

  // Delete file from storage if exists
  if (policy.file_path) {
    await supabase.storage.from("company-documents").remove([policy.file_path]);
  }

  const { error } = await supabase
    .from("company_policies")
    .delete()
    .eq("id", policyId)
    .eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "delete",
    entity_type: "company_policy",
    entity_id: policyId,
    description: "Deleted draft policy",
  });

  revalidate();
  return { success: true };
}

export async function updatePolicy(policyId: string, formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyContext();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const category = (formData.get("category") as string) || "general";
  const version = (formData.get("version") as string) || "1.0";
  const reviewDate = (formData.get("reviewDate") as string) || null;
  const requiresAcknowledgement = formData.get("requiresAcknowledgement") === "true";

  if (!title?.trim()) return { error: "Title is required" };

  const { error } = await supabase
    .from("company_policies")
    .update({
      title: title.trim(),
      description,
      category,
      version,
      review_date: reviewDate || null,
      requires_acknowledgement: requiresAcknowledgement,
    })
    .eq("id", policyId)
    .eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "company_policy",
    entity_id: policyId,
    description: `Updated policy: ${title.trim()}`,
  });

  revalidate();
  return { success: true };
}

export async function replaceFile(policyId: string, formData: FormData) {
  const { supabase, companyId, userId } = await getCompanyContext();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };
  if (file.type !== "application/pdf") return { error: "Only PDF files are supported" };
  if (file.size > 10 * 1024 * 1024) return { error: "File must be under 10MB" };

  // Get old file path
  const { data: policy, error: fetchErr } = await supabase
    .from("company_policies")
    .select("file_path")
    .eq("id", policyId)
    .eq("company_id", companyId)
    .single();

  if (fetchErr || !policy) return { error: "Policy not found" };

  // Upload new file
  const result = await uploadDocument(companyId, "policies", file);
  if (result.error) return { error: result.error };

  // Delete old file
  if (policy.file_path) {
    await supabase.storage.from("company-documents").remove([policy.file_path]);
  }

  const { error } = await supabase
    .from("company_policies")
    .update({
      file_path: result.path,
      file_name: file.name,
      file_size_bytes: file.size,
    })
    .eq("id", policyId)
    .eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "company_policy",
    entity_id: policyId,
    description: `Replaced policy file: ${file.name}`,
  });

  revalidate();
  return { success: true };
}

export async function regenerateAccessToken(policyId: string) {
  const { supabase, companyId, userId } = await getCompanyContext();

  const { error } = await supabase
    .from("company_policies")
    .update({ access_token: crypto.randomUUID() })
    .eq("id", policyId)
    .eq("company_id", companyId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "company_policy",
    entity_id: policyId,
    description: "Regenerated policy access token",
  });

  revalidate();
  return { success: true };
}

export async function reactivatePolicy(policyId: string) {
  const { supabase, companyId, userId } = await getCompanyContext();

  const { error } = await supabase
    .from("company_policies")
    .update({
      status: "draft",
      archived_at: null,
      archived_by: null,
      activated_at: null,
      activated_by: null,
    })
    .eq("id", policyId)
    .eq("company_id", companyId)
    .eq("status", "archived");

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "company_policy",
    entity_id: policyId,
    description: "Reactivated archived policy to draft",
  });

  revalidate();
  return { success: true };
}
