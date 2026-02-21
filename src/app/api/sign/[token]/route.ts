import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("id, contract_type, start_date, end_date, weekly_hours, salary_amount, salary_currency, signing_status, signer_name, document_url, notes, employees(first_name, last_name), companies(name)")
    .eq("signature_token", token)
    .single();

  if (error || !contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  // Generate signed URL for document if exists
  let documentSignedUrl: string | null = null;
  if (contract.document_url) {
    const { data } = await supabase.storage
      .from("company-documents")
      .createSignedUrl(contract.document_url, 3600);
    documentSignedUrl = data?.signedUrl ?? null;
  }

  return NextResponse.json({
    id: contract.id,
    contractType: contract.contract_type,
    startDate: contract.start_date,
    endDate: contract.end_date,
    weeklyHours: contract.weekly_hours,
    salaryAmount: contract.salary_amount,
    salaryCurrency: contract.salary_currency,
    signingStatus: contract.signing_status,
    signerName: contract.signer_name,
    notes: contract.notes,
    documentUrl: documentSignedUrl,
    employee: contract.employees,
    company: contract.companies,
  });
}
