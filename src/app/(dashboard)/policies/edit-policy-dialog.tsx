"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { updatePolicy } from "@/lib/actions/policies";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import type { CompanyPolicy } from "@/lib/types/database";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "health_and_safety", label: "Health & Safety" },
  { value: "equality_diversity", label: "Equality & Diversity" },
  { value: "data_protection", label: "Data Protection" },
  { value: "disciplinary", label: "Disciplinary" },
  { value: "grievance", label: "Grievance" },
  { value: "absence", label: "Absence" },
  { value: "safeguarding", label: "Safeguarding" },
  { value: "whistleblowing", label: "Whistleblowing" },
  { value: "other", label: "Other" },
];

export function EditPolicyDialog({ policy }: { policy: CompanyPolicy }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(policy.category);
  const [requiresAck, setRequiresAck] = useState(policy.requires_acknowledgement);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    formData.set("requiresAcknowledgement", requiresAck ? "true" : "false");

    const result = await updatePolicy(policy.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Policy updated");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
          <DialogDescription>Update policy metadata.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Policy title</Label>
            <Input id="edit-title" name="title" required defaultValue={policy.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" name="description" defaultValue={policy.description ?? ""} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-version">Version</Label>
              <Input id="edit-version" name="version" defaultValue={policy.version} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-reviewDate">Review date</Label>
            <Input
              id="edit-reviewDate"
              name="reviewDate"
              type="date"
              defaultValue={policy.review_date ? policy.review_date.split("T")[0] : ""}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-requiresAck"
              checked={requiresAck}
              onCheckedChange={(checked) => setRequiresAck(checked === true)}
            />
            <Label htmlFor="edit-requiresAck" className="text-sm">
              Requires employee acknowledgement
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
