import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Fetch contract
  const { data: contract, error: fetchError } = await supabase
    .from("contracts")
    .select("id, company_id, signing_status")
    .eq("signature_token", token)
    .single();

  if (fetchError || !contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (contract.signing_status === "signed") {
    return NextResponse.json({ error: "Contract is already signed" }, { status: 400 });
  }

  const body = await request.json();
  const { signatureData, signerName } = body;

  if (!signatureData || !signerName) {
    return NextResponse.json({ error: "Signature and name are required" }, { status: 400 });
  }

  // Cap signature data at 500KB
  if (signatureData.length > 512000) {
    return NextResponse.json({ error: "Signature data too large" }, { status: 400 });
  }

  const signerIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      signing_status: "signed",
      signed_at: new Date().toISOString(),
      signature_data: signatureData,
      signer_name: signerName,
      signer_ip: signerIp,
    })
    .eq("id", contract.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to save signature" }, { status: 500 });
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    company_id: contract.company_id,
    user_id: null,
    action: "update",
    entity_type: "contract",
    entity_id: contract.id,
    description: `Contract signed by ${signerName}`,
    metadata: { signer_ip: signerIp },
  });

  return NextResponse.json({ success: true });
}
