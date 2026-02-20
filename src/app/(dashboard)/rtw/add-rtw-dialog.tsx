"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createRtwCheck } from "@/lib/actions/rtw";
import { toast } from "sonner";

interface Props {
  employees: Array<{ id: string; first_name: string; last_name: string }>;
}

const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "biometric_residence_permit", label: "Biometric Residence Permit (BRP)" },
  { value: "share_code", label: "Share Code" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "travel_document", label: "Travel Document" },
  { value: "visa", label: "Visa" },
  { value: "other", label: "Other" },
];

export function AddRtwDialog({ employees }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createRtwCheck(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Right-to-work check recorded");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Check
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record RTW Check</DialogTitle>
          <DialogDescription>Record a right-to-work check for an employee.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee</Label>
            <Select name="employeeId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentType">Document type</Label>
            <Select name="documentType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((dt) => (
                  <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentReference">Document reference</Label>
              <Input id="documentReference" name="documentReference" placeholder="e.g. passport number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shareCode">Share code</Label>
              <Input id="shareCode" name="shareCode" placeholder="If applicable" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkDate">Check date</Label>
              <Input id="checkDate" name="checkDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry date</Label>
              <Input id="expiryDate" name="expiryDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any additional notes..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Record Check"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
