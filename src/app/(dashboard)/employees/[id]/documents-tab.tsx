"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from "lucide-react";
import { RequestDocumentDialog } from "./request-document-dialog";
import type { DocumentRequest, DocumentRequestItem } from "@/lib/types/database";

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

function getItemLabel(item: DocumentRequestItem): string {
  if (item.document_type === "other" && item.custom_label) return item.custom_label;
  return DOC_TYPE_LABELS[item.document_type] ?? item.document_type;
}

function statusBadge(status: string) {
  switch (status) {
    case "complete":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>;
    case "expired":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
  }
}

type RequestWithItems = DocumentRequest & { items: (DocumentRequestItem & { signedUrl?: string | null })[] };

export function DocumentsTab({
  employeeId,
  employeeName,
  requests,
}: {
  employeeId: string;
  employeeName: string;
  requests: RequestWithItems[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{requests.length} request{requests.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <FileText className="h-3 w-3 mr-1" /> Request Documents
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground text-sm border rounded-md">
          No document requests yet. Use the button above to request documents from this employee.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const expanded = expandedIds.has(req.id);
            const deadlineFormatted = new Date(req.deadline).toLocaleDateString("en-GB");
            const createdFormatted = new Date(req.created_at).toLocaleDateString("en-GB");
            return (
              <Card key={req.id}>
                <CardHeader className="pb-0 pt-4 px-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{req.title}</span>
                        {statusBadge(req.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested {createdFormatted} · Deadline {deadlineFormatted} · {req.items.length} document{req.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status !== "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => setDialogOpen(true)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Re-request
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => toggleExpand(req.id)}
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expanded && (
                  <CardContent className="pt-3 pb-4 px-4">
                    {req.message && (
                      <p className="text-xs text-muted-foreground italic mb-3 border-l-2 border-muted pl-2">{req.message}</p>
                    )}
                    <div className="space-y-2">
                      {req.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div>
                              <span>{getItemLabel(item)}</span>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.status === "uploaded" ? (
                              <>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Uploaded</Badge>
                                {item.signedUrl && (
                                  <a
                                    href={item.signedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    View <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <RequestDocumentDialog
        employeeId={employeeId}
        employeeName={employeeName}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
