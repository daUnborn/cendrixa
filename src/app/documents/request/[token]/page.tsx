"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, Upload, FileText, AlertCircle } from "lucide-react";

interface RequestItem {
  id: string;
  document_type: string;
  custom_label: string | null;
  notes: string | null;
  status: string;
}

interface RequestData {
  id: string;
  title: string;
  message: string | null;
  deadline: string;
  token_expires_at: string;
  status: string;
  employee: { first_name: string; last_name: string } | null;
  company: { name: string } | null;
  document_request_items: RequestItem[];
}

const DOC_TYPE_LABELS: Record<string, string> = {
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

function getLabel(item: RequestItem): string {
  if (item.document_type === "other" && item.custom_label) return item.custom_label;
  return DOC_TYPE_LABELS[item.document_type] ?? item.document_type;
}

export default function DocumentRequestPage() {
  const params = useParams();
  const token = params.token as string;

  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(`/api/documents/request/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request not found");
        return data;
      })
      .then(setRequest)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  function handleFileChange(itemId: string, file: File | null) {
    if (!file) return;
    setFiles(prev => ({ ...prev, [itemId]: file }));
  }

  const items = request?.document_request_items ?? [];
  const allUploaded = items.length > 0 && items.every(item => !!files[item.id]);

  async function handleSubmit() {
    if (!request || !allUploaded) return;
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    for (const item of items) {
      formData.append(`item_${item.id}`, files[item.id]);
    }

    try {
      const res = await fetch(`/api/documents/request/${token}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
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

  if (error && !request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <CardTitle className="text-red-600">Link Unavailable</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Documents Submitted</CardTitle>
            <CardDescription>
              Your documents have been uploaded successfully. {request?.company?.name} will review them shortly. You may close this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const deadlineFormatted = request?.deadline
    ? new Date(request.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">{request?.company?.name}</p>
            <CardTitle>{request?.title}</CardTitle>
            {request?.message && (
              <CardDescription className="text-sm text-foreground whitespace-pre-wrap mt-2 border-l-2 border-brand pl-3">
                {request.message}
              </CardDescription>
            )}
            <div className="mt-3">
              <Badge variant="outline" className="text-red-700 border-red-300">
                Deadline: {deadlineFormatted}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Document Items */}
        <div className="space-y-4">
          {items.map(item => {
            const file = files[item.id];
            return (
              <Card key={item.id} className={file ? "border-green-300 bg-green-50/30" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="font-medium text-sm">{getLabel(item)}</p>
                        {file && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">{item.notes}</p>
                      )}
                      {file && (
                        <p className="text-xs text-green-700 mt-1 ml-6 truncate max-w-xs">{file.name}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        ref={el => { fileInputRefs.current[item.id] = el; }}
                        onChange={e => handleFileChange(item.id, e.target.files?.[0] ?? null)}
                      />
                      <Button
                        variant={file ? "outline" : "default"}
                        size="sm"
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        {file ? "Change" : "Upload"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
        <div className="space-y-2">
          {!allUploaded && (
            <p className="text-sm text-center text-muted-foreground">
              Upload all {items.length} document{items.length !== 1 ? "s" : ""} to submit.
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            disabled={!allUploaded || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
            ) : (
              "Submit Documents"
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Accepted formats: PDF, JPG, PNG · Max 10MB per file
        </p>
      </div>
    </div>
  );
}
