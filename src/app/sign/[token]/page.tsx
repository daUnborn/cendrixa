"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/signature-pad";
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
  const [signerName, setSignerName] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signatureData || !signerName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sign/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData, signerName: signerName.trim() }),
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

            {contract?.documentUrl && (
              <a
                href={contract.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                <FileText className="h-4 w-4" />
                View Contract Document
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Signature</CardTitle>
            <CardDescription>Please sign below and enter your full name to confirm.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Draw your signature</Label>
                <SignaturePad onSignatureChange={setSignatureData} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signerName">Full legal name</Label>
                <Input
                  id="signerName"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !signatureData || !signerName.trim()}
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                ) : (
                  "Sign Contract"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
