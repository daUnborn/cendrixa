"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadPolicy } from "@/lib/actions/policies";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

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

export function UploadPolicyDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("general");
  const [requiresAck, setRequiresAck] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("category", category);
    formData.set("requiresAcknowledgement", requiresAck ? "true" : "false");

    const result = await uploadPolicy(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Policy uploaded as draft");
      setOpen(false);
      form.reset();
      setCategory("general");
      setRequiresAck(true);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Policy</DialogTitle>
          <DialogDescription>
            Upload a PDF policy document. It will be saved as a draft.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Policy title</Label>
            <Input id="title" name="title" required placeholder="e.g. Absence Management Policy" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" placeholder="Brief description of the policy" rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">PDF file</Label>
            <Input id="file" name="file" type="file" accept=".pdf,application/pdf" />
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
              <Label htmlFor="version">Version</Label>
              <Input id="version" name="version" defaultValue="1.0" placeholder="1.0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewDate">Review date (optional)</Label>
            <Input id="reviewDate" name="reviewDate" type="date" />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresAck"
              checked={requiresAck}
              onCheckedChange={(checked) => setRequiresAck(checked === true)}
            />
            <Label htmlFor="requiresAck" className="text-sm">
              Requires employee acknowledgement
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : "Upload Policy"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
