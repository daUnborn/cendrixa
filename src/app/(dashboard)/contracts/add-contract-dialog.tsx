"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createContract } from "@/lib/actions/contracts";
import { toast } from "sonner";

interface Props {
  employees: Array<{ id: string; first_name: string; last_name: string }>;
}

export function AddContractDialog({ employees }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createContract(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Contract added");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Add Contract</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Contract</DialogTitle>
          <DialogDescription>Record a new employee contract.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select name="employeeId" required>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contract type</Label>
              <Select name="contractType" defaultValue="full_time">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="fixed_term">Fixed Term</SelectItem>
                  <SelectItem value="zero_hours">Zero Hours</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Weekly hours</Label>
              <Input name="weeklyHours" type="number" step="0.5" defaultValue="40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input name="endDate" type="date" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Renewal date</Label>
              <Input name="renewalDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label>Probation end date</Label>
              <Input name="probationEndDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Annual salary (GBP)</Label>
            <Input name="salaryAmount" type="number" step="0.01" placeholder="e.g. 30000" />
          </div>
          <div className="space-y-2">
            <Label>Contract document</Label>
            <Input name="document" type="file" accept=".pdf" />
            <p className="text-xs text-muted-foreground">Upload the contract PDF (max 10MB)</p>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea name="notes" placeholder="Any notes..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Add Contract"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
