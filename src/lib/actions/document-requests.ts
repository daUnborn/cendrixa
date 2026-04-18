"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendDocumentRequestEmail } from "@/lib/email/resend";
import type { DocRequestDocumentType } from "@/lib/types/database";

async function getCompanyContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id, id")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("No company found");
  return { supabase, companyId: member.company_id, memberId: member.id, userId: user.id };
}

export interface DocumentItemInput {
  document_type: DocRequestDocumentType;
  custom_label: string | null;
  notes: string | null;
}

export async function createDocumentRequest({
  employeeId,
  title,
  message,
  deadline,
  items,
}: {
  employeeId: string;
  title: string;
  message: string | null;
  deadline: string;
  items: DocumentItemInput[];
}) {
  const { supabase, companyId, memberId, userId } = await getCompanyContext();

  // Fetch employee + company for email
  const [{ data: employee }, { data: company }] = await Promise.all([
    supabase.from("employees").select("id, first_name, last_name, email").eq("id", employeeId).eq("company_id", companyId).single(),
    supabase.from("companies").select("name, notification_email").eq("id", companyId).single(),
  ]);

  if (!employee) return { error: "Employee not found" };
  if (!employee.email) return { error: "This employee has no email address on file. Add one before requesting documents." };
  if (!company) return { error: "Company not found" };

  // Token expires at deadline (or 30 days, whichever is sooner)
  const deadlineDate = new Date(deadline);
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const tokenExpiresAt = deadlineDate < thirtyDays ? deadlineDate : thirtyDays;
  tokenExpiresAt.setHours(23, 59, 59, 999);

  // Insert request
  const { data: request, error: reqError } = await supabase
    .from("document_requests")
    .insert({
      company_id: companyId,
      employee_id: employeeId,
      title,
      message: message || null,
      deadline,
      token_expires_at: tokenExpiresAt.toISOString(),
      created_by: memberId,
    })
    .select()
    .single();

  if (reqError || !request) {
    return { error: reqError?.message || "Failed to create request" };
  }

  // Insert items
  const { error: itemsError } = await supabase.from("document_request_items").insert(
    items.map(item => ({
      request_id: request.id,
      document_type: item.document_type,
      custom_label: item.custom_label || null,
      notes: item.notes || null,
    }))
  );

  if (itemsError) {
    // Compensating delete
    await supabase.from("document_requests").delete().eq("id", request.id);
    return { error: itemsError.message };
  }

  // Build upload link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cendrixa.com";
  const uploadLink = `${baseUrl}/documents/request/${request.token}`;

  // Send email to employee
  const documentItems = items.map(item => ({
    label: item.document_type === "other" && item.custom_label
      ? item.custom_label
      : formatDocumentType(item.document_type),
    notes: item.notes,
  }));

  try {
    await sendDocumentRequestEmail({
      to: employee.email,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      companyName: company.name,
      requestTitle: title,
      message,
      deadline,
      uploadLink,
      documentItems,
    });
  } catch (emailError) {
    console.error("Failed to send document request email:", emailError);
    // Don't fail the whole action if email fails — request is created
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "create",
    entity_type: "document_request",
    entity_id: request.id,
    description: `Document request "${title}" sent to ${employee.first_name} ${employee.last_name}`,
    metadata: { item_count: items.length, deadline },
  });

  revalidatePath(`/employees/${employeeId}`);
  return { success: true, requestId: request.id };
}

function formatDocumentType(type: DocRequestDocumentType): string {
  const labels: Record<DocRequestDocumentType, string> = {
    passport: "Passport",
    brp: "Biometric Residence Permit (BRP)",
    share_code: "Share Code",
    ni_letter: "National Insurance Letter",
    proof_of_address: "Proof of Address",
    bank_statement: "Bank Statement",
    birth_certificate: "Birth Certificate",
    visa: "Visa",
    other: "Other Document",
  };
  return labels[type];
}
