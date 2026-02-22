import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Fetch contract with document URL
  const { data: contract, error: fetchError } = await supabase
    .from("contracts")
    .select("id, company_id, signing_status, document_url")
    .eq("signature_token", token)
    .single();

  if (fetchError || !contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (contract.signing_status === "signed") {
    return NextResponse.json({ error: "Contract is already signed" }, { status: 400 });
  }

  const body = await request.json();
  const { signatureData, signerName, signatureZone } = body;

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

  let signedDocumentUrl: string | null = null;

  // Embed signature in PDF if document exists
  if (contract.document_url && signatureZone) {
    try {
      // Download original PDF from Supabase Storage
      const { data: pdfBlob, error: downloadError } = await supabase.storage
        .from('company-documents')
        .download(contract.document_url);

      if (downloadError) {
        console.error('Failed to download PDF:', downloadError);
      } else if (pdfBlob) {
        // Load PDF with pdf-lib
        const pdfDoc = await PDFDocument.load(await pdfBlob.arrayBuffer());

        // Embed signature image
        const signatureImage = await pdfDoc.embedPng(signatureData);
        const page = pdfDoc.getPage(signatureZone.page - 1); // 0-indexed

        // PDF uses bottom-left origin, so we need to flip the y coordinate
        const pageHeight = page.getHeight();

        page.drawImage(signatureImage, {
          x: signatureZone.x,
          y: pageHeight - signatureZone.y - signatureZone.height,
          width: signatureZone.width,
          height: signatureZone.height,
        });

        // Add timestamp and signer name below signature
        const timestamp = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        page.drawText(`Signed by: ${signerName}`, {
          x: signatureZone.x,
          y: pageHeight - signatureZone.y - signatureZone.height - 20,
          size: 9,
          color: rgb(0.3, 0.3, 0.3),
        });

        page.drawText(`Date: ${timestamp}`, {
          x: signatureZone.x,
          y: pageHeight - signatureZone.y - signatureZone.height - 35,
          size: 9,
          color: rgb(0.3, 0.3, 0.3),
        });

        // Save signed PDF
        const signedPdfBytes = await pdfDoc.save();
        const signedPath = `${contract.company_id}/contracts/${contract.id}_signed.pdf`;

        const { error: uploadError } = await supabase.storage
          .from('company-documents')
          .upload(signedPath, signedPdfBytes, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          console.error('Failed to upload signed PDF:', uploadError);
        } else {
          signedDocumentUrl = signedPath;
        }
      }
    } catch (error) {
      console.error('Error embedding signature in PDF:', error);
      // Continue with signature save even if PDF embedding fails
    }
  }

  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      signing_status: "signed",
      signed_at: new Date().toISOString(),
      signature_data: signatureData,
      signer_name: signerName,
      signer_ip: signerIp,
      signed_document_url: signedDocumentUrl,
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
