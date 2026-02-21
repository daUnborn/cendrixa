"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, FileText, Loader2 } from "lucide-react";

interface PolicyEmployee {
  id: string;
  name: string;
  acknowledged?: boolean;
}

interface PolicyData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  version: string;
  companyName: string;
  requiresAcknowledgement: boolean;
  documentUrl: string | null;
  employees: PolicyEmployee[];
}

export default function PolicyAcknowledgePage() {
  const params = useParams();
  const token = params.token as string;
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyAcknowledged, setAlreadyAcknowledged] = useState(false);

  useEffect(() => {
    fetch(`/api/policy/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Policy not found");
        }
        return res.json();
      })
      .then((data) => setPolicy(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // When employee is selected, check if already acknowledged
  useEffect(() => {
    if (!selectedEmployeeId || !policy) return;
    const emp = policy.employees.find((e) => e.id === selectedEmployeeId);
    if (emp?.acknowledged) {
      setAlreadyAcknowledged(true);
      setSignerName(emp.name);
    } else {
      setAlreadyAcknowledged(false);
      if (emp) setSignerName(emp.name);
    }
  }, [selectedEmployeeId, policy]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acknowledged || !signerName.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/policy/${token}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim(),
          employeeId: selectedEmployeeId || undefined,
          signerEmail: signerEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setAlreadyAcknowledged(true);
          return;
        }
        throw new Error(data.error);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
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

  if (error && !policy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Policy Not Available</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted || alreadyAcknowledged) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-green-700">
              {alreadyAcknowledged ? "Already Acknowledged" : "Policy Acknowledged"}
            </CardTitle>
            <CardDescription>
              {alreadyAcknowledged
                ? "This policy has already been acknowledged. You may close this page."
                : "Thank you. Your acknowledgement has been recorded. You may close this page."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Policy Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {policy?.companyName}
            </div>
            <CardTitle>{policy?.title}</CardTitle>
            {policy?.description && (
              <CardDescription>{policy.description}</CardDescription>
            )}
            <div className="flex gap-4 text-sm text-muted-foreground pt-2">
              <span>Category: <span className="capitalize">{policy?.category?.replace(/_/g, " ")}</span></span>
              <span>Version: {policy?.version}</span>
            </div>
          </CardHeader>
        </Card>

        {/* PDF Viewer */}
        {policy?.documentUrl && (
          <Card>
            <CardContent className="p-0">
              <iframe
                src={policy.documentUrl}
                className="h-[600px] w-full rounded-lg"
                title={policy.title}
              />
            </CardContent>
          </Card>
        )}

        {/* Acknowledgement Form */}
        {policy?.requiresAcknowledgement && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acknowledge Policy</CardTitle>
              <CardDescription>
                Please confirm that you have read and understood this policy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {policy.employees.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select your name</Label>
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {policy.employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} {emp.acknowledged ? "(acknowledged)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signerName">Full name</Label>
                  <Input
                    id="signerName"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signerEmail">Email (optional)</Label>
                  <Input
                    id="signerEmail"
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acknowledge"
                    checked={acknowledged}
                    onCheckedChange={(checked) => setAcknowledged(checked === true)}
                  />
                  <Label htmlFor="acknowledge" className="text-sm leading-5">
                    I acknowledge that I have read and understood this policy
                  </Label>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || !acknowledged || !signerName.trim()}
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : (
                    "Submit Acknowledgement"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
