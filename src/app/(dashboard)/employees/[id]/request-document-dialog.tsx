"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createDocumentRequest } from "@/lib/actions/document-requests";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { DocRequestDocumentType } from "@/lib/types/database";

const DOC_TYPES: { value: DocRequestDocumentType; label: string }[] = [
  { value: "passport", label: "Passport" },
  { value: "brp", label: "Biometric Residence Permit (BRP)" },
  { value: "share_code", label: "Share Code" },
  { value: "ni_letter", label: "National Insurance Letter" },
  { value: "proof_of_address", label: "Proof of Address" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "visa", label: "Visa" },
  { value: "other", label: "Other (specify)" },
];

interface ItemInput {
  key: string;
  document_type: DocRequestDocumentType;
  custom_label: string;
  notes: string;
}

function emptyItem(): ItemInput {
  return { key: crypto.randomUUID(), document_type: "passport", custom_label: "", notes: "" };
}

export function RequestDocumentDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: {
  employeeId: string;
  employeeName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState("");
  const [items, setItems] = useState<ItemInput[]>([emptyItem()]);

  function addItem() {
    setItems(prev => [...prev, emptyItem()]);
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(i => i.key !== key));
  }

  function updateItem(key: string, field: keyof ItemInput, value: string) {
    setItems(prev => prev.map(i => i.key === key ? { ...i, [field]: value } : i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Add at least one document item");
      return;
    }
    setLoading(true);
    const result = await createDocumentRequest({
      employeeId,
      title,
      message: message || null,
      deadline,
      items: items.map(i => ({
        document_type: i.document_type,
        custom_label: i.document_type === "other" ? i.custom_label || null : null,
        notes: i.notes || null,
      })),
    });
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Document request sent");
      onOpenChange(false);
      setTitle("");
      setMessage("");
      setDeadline("");
      setItems([emptyItem()]);
    }
    setLoading(false);
  }

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Documents</DialogTitle>
          <DialogDescription>
            {employeeName} will receive an email with a secure link to upload the requested documents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Request title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Right to Work Check"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              min={minDate}
              onChange={e => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to employee <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Any additional instructions for the employee..."
              rows={3}
            />
          </div>

          {/* Document items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Documents requested</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-3 w-3 mr-1" /> Add item
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={item.key} className="rounded-md border p-3 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Document {idx + 1}</span>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600" onClick={() => removeItem(item.key)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Select
                    value={item.document_type}
                    onValueChange={v => updateItem(item.key, "document_type", v as DocRequestDocumentType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {item.document_type === "other" && (
                  <Input
                    placeholder="Specify document type"
                    value={item.custom_label}
                    onChange={e => updateItem(item.key, "custom_label", e.target.value)}
                    required
                  />
                )}
                <Input
                  placeholder="Notes for employee (optional, e.g. must be dated within 3 months)"
                  value={item.notes}
                  onChange={e => updateItem(item.key, "notes", e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Request"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
