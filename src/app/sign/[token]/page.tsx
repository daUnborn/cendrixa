"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDFSignatureViewer } from "@/components/pdf-signature-viewer";
import { CheckCircle, FileText, Loader2 } from "lucide-react";

interface ContractData {
  id: string;
  contractType: string;
  startDate: string;
  endDate: string | null;
  weeklyHours: number | null;
  salaryAmount: number | null;
  salaryCurrency: string;
  signingStatus: string;
  signerName: string | null;
  notes: string | null;
  documentUrl: string | null;
  employee: { first_name: string; last_name: string } | null;
  company: { name: string } | null;
}

export default function SignContractPage() {
  const params = useParams();
  const token = params.token as string;
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Contract not found");
        }
        return res.json();
      })
      .then((data) => {
        setContract(data);
        if (data.signingStatus === "signed") setSigned(true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSignatureComplete(
    signatureData: string,
    signerName: string,
    signatureZone: { page: number; x: number; y: number; width: number; height: number }
  ) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sign/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData, signerName, signatureZone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSigned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit signature");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Link Invalid</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Contract Signed</CardTitle>
            <CardDescription>
              {contract?.signerName
                ? `Signed by ${contract.signerName}. You may close this page.`
                : "Thank you. Your signature has been recorded. You may close this page."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sign Contract</CardTitle>
            <CardDescription>
              {contract?.company?.name} has sent you a contract to sign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Employee</p>
                <p className="font-medium">
                  {contract?.employee
                    ? `${contract.employee.first_name} ${contract.employee.last_name}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Contract Type</p>
                <p className="font-medium capitalize">{contract?.contractType?.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {contract?.startDate ? new Date(contract.startDate).toLocaleDateString("en-GB") : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {contract?.endDate ? new Date(contract.endDate).toLocaleDateString("en-GB") : "Open-ended"}
                </p>
              </div>
              {contract?.weeklyHours && (
                <div>
                  <p className="text-muted-foreground">Weekly Hours</p>
                  <p className="font-medium">{contract.weeklyHours}</p>
                </div>
              )}
              {contract?.salaryAmount && (
                <div>
                  <p className="text-muted-foreground">Annual Salary</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("en-GB", { style: "currency", currency: contract.salaryCurrency || "GBP" }).format(contract.salaryAmount)}
                  </p>
                </div>
              )}
            </div>

            {contract?.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{contract.notes}</p>
              </div>
            )}

          </CardContent>
        </Card>

        {contract?.documentUrl ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sign Document</CardTitle>
              <CardDescription>
                Review the document below and tap the signature zone to sign.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <PDFSignatureViewer
                pdfUrl={contract.documentUrl}
                onSignatureComplete={handleSignatureComplete}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-yellow-700">No Document Available</CardTitle>
              <CardDescription>
                This contract does not have an attached PDF document. Please contact {contract?.company?.name} for assistance.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
