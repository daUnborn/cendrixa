"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadDocument } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import { sendSigningLinkEmail } from "@/lib/email/resend";

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
    signed_document_url: null,
    link_sent_at: null,
    link_sent_via: null,
  }).select().single();

  if (error) {
    console.error('Contract creation error:', error);
    return { error: error.message };
  }

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
    .update({
      signature_token: token,
      signing_status: "pending",
      link_sent_via: "manual"
    })
    .eq("id", contractId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    company_id: companyId,
    user_id: userId,
    action: "update",
    entity_type: "contract",
    entity_id: contractId,
    description: "Generated contract signing link (manual)",
  });

  revalidatePath("/contracts");
  return { success: true, token };
}

export async function generateAndSendSigningLink(
  contractId: string,
  deliveryMethod: 'email' | 'manual' = 'email'
) {
  const { supabase, companyId, userId } = await getCompanyId();

  // Get contract and employee details
  const { data: contract } = await supabase
    .from("contracts")
    .select(`
      id,
      contract_type,
      signing_status,
      employees!inner (
        first_name,
        last_name,
        email
      ),
      companies!inner (
        name
      )
    `)
    .eq("id", contractId)
    .eq("company_id", companyId)
    .single();

  if (!contract) return { error: "Contract not found" };
  if (contract.signing_status === "signed") return { error: "Contract is already signed" };

  // Type assertion for the joined data
  const employee = contract.employees as unknown as { first_name: string; last_name: string; email: string };
  const company = contract.companies as unknown as { name: string };

  const token = crypto.randomUUID();

  // Update contract with token
  const { error } = await supabase
    .from("contracts")
    .update({
      signature_token: token,
      signing_status: "pending",
      link_sent_at: deliveryMethod === 'email' ? new Date().toISOString() : null,
      link_sent_via: deliveryMethod
    })
    .eq("id", contractId);

  if (error) return { error: error.message };

  const signingLink = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${token}`;

  // Send via email
  if (deliveryMethod === 'email') {
    if (!employee?.email) {
      return { error: 'Employee has no email address' };
    }

    try {
      await sendSigningLinkEmail({
        to: employee.email,
        employeeName: `${employee.first_name} ${employee.last_name}`,
        signingLink,
        contractType: contract.contract_type,
        companyName: company?.name || 'Your company'
      });

      await supabase.from("audit_logs").insert({
        company_id: companyId,
        user_id: userId,
        action: "update",
        entity_type: "contract",
        entity_id: contractId,
        description: `Sent contract signing link via email to ${employee.email}`,
        metadata: {
          delivery_method: 'email',
          recipient_email: employee.email
        }
      });
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      return { error: `Failed to send email: ${emailError.message}` };
    }
  } else {
    await supabase.from("audit_logs").insert({
      company_id: companyId,
      user_id: userId,
      action: "update",
      entity_type: "contract",
      entity_id: contractId,
      description: "Generated contract signing link (manual)",
    });
  }

  revalidatePath("/contracts");
  return {
    success: true,
    token,
    sentVia: deliveryMethod,
    recipientEmail: deliveryMethod === 'email' ? employee?.email : undefined
  };
}
