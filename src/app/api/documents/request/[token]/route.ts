import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { uploadDocumentAsService } from "@/lib/supabase/storage";
import { sendDocumentUploadNotificationEmail } from "@/lib/email/resend";

// GET — fetch request + items for the upload page
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: request, error } = await supabase
    .from("document_requests")
    .select(`
      id, title, message, deadline, token_expires_at, status,
      employee:employees(first_name, last_name, email),
      company:companies(name),
      document_request_items(id, document_type, custom_label, notes, status)
    `)
    .eq("token", token)
    .single();

  if (error || !request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.status === "complete") {
    return NextResponse.json({ error: "This request has already been completed." }, { status: 410 });
  }

  if (new Date(request.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "This link has expired. Please contact your employer for a new link." }, { status: 410 });
  }

  return NextResponse.json(request);
}

// POST — handle file uploads, mark complete, notify HR
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Re-validate request
  const { data: request, error } = await supabase
    .from("document_requests")
    .select(`
      id, title, deadline, token_expires_at, status,
      company_id, employee_id,
      employee:employees(first_name, last_name),
      company:companies(name, notification_email),
      document_request_items(id, document_type, custom_label, status)
    `)
    .eq("token", token)
    .single();

  if (error || !request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (request.status === "complete") {
    return NextResponse.json({ error: "Already completed" }, { status: 410 });
  }
  if (new Date(request.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  const formData = await req.formData();
  const items = request.document_request_items as Array<{
    id: string;
    document_type: string;
    custom_label: string | null;
    status: string;
  }>;

  const uploadedLabels: string[] = [];

  for (const item of items) {
    const file = formData.get(`item_${item.id}`) as File | null;
    if (!file) {
      return NextResponse.json({ error: `Missing file for document item` }, { status: 400 });
    }

    const { path, error: uploadError } = await uploadDocumentAsService(
      request.company_id,
      `employee-documents/${request.employee_id}`,
      file
    );

    if (uploadError || !path) {
      return NextResponse.json({ error: `Failed to upload file: ${uploadError}` }, { status: 500 });
    }

    await supabase.from("document_request_items").update({
      file_path: path,
      file_name: file.name,
      uploaded_at: new Date().toISOString(),
      status: "uploaded",
    }).eq("id", item.id);

    const label = item.document_type === "other" && item.custom_label
      ? item.custom_label
      : formatDocumentType(item.document_type);
    uploadedLabels.push(label);
  }

  // Mark request complete
  await supabase.from("document_requests").update({ status: "complete" }).eq("id", request.id);

  // Audit log
  await supabase.from("audit_logs").insert({
    company_id: request.company_id,
    user_id: null,
    action: "create",
    entity_type: "document_request",
    entity_id: request.id,
    description: `Employee uploaded documents for request "${request.title}"`,
    metadata: { uploaded_count: items.length },
  });

  // Notify HR
  const employee = (request.employee as unknown) as { first_name: string; last_name: string } | null;
  const company = (request.company as unknown) as { name: string; notification_email: string | null } | null;

  if (company && employee) {
    // Get notification email — falls back to owner email
    let notifyEmail = company.notification_email;
    if (!notifyEmail) {
      const { data: owner } = await supabase
        .from("company_members")
        .select("user_id")
        .eq("company_id", request.company_id)
        .eq("role", "owner")
        .single();

      if (owner) {
        const { data: authUser } = await supabase.auth.admin.getUserById(owner.user_id);
        notifyEmail = authUser.user?.email ?? null;
      }
    }

    if (notifyEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cendrixa.com";
      try {
        await sendDocumentUploadNotificationEmail({
          to: notifyEmail,
          companyName: company.name,
          employeeName: `${employee.first_name} ${employee.last_name}`,
          requestTitle: request.title,
          uploadedItems: uploadedLabels,
          viewLink: `${baseUrl}/employees/${request.employee_id}`,
        });
      } catch (e) {
        console.error("Failed to send HR notification email:", e);
      }
    }
  }

  return NextResponse.json({ success: true });
}

function formatDocumentType(type: string): string {
  const labels: Record<string, string> = {
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
  return labels[type] ?? type;
}
