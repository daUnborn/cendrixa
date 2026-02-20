"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { completeStep, closeCase } from "@/lib/actions/cases";
import { toast } from "sonner";

export function StepCompleteButton({ stepId, caseId }: { stepId: string; caseId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  async function handleComplete() {
    setLoading(true);
    const result = await completeStep(stepId, caseId, notes);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Step completed");
      setOpen(false);
      setNotes("");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Complete Step</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Step</DialogTitle>
          <DialogDescription>Add any notes before marking this step as complete.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Record any relevant notes..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleComplete} disabled={loading}>
              {loading ? "Completing..." : "Complete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const DISCIPLINARY_OUTCOMES = [
  { value: "no_action", label: "No Action" },
  { value: "verbal_warning", label: "Verbal Warning" },
  { value: "first_written_warning", label: "First Written Warning" },
  { value: "final_written_warning", label: "Final Written Warning" },
  { value: "dismissal", label: "Dismissal" },
];

const GRIEVANCE_OUTCOMES = [
  { value: "upheld", label: "Upheld" },
  { value: "partially_upheld", label: "Partially Upheld" },
  { value: "not_upheld", label: "Not Upheld" },
];

export function CloseCaseButton({ caseId, caseType }: { caseId: string; caseType: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState("");

  const outcomes = caseType === "disciplinary" ? DISCIPLINARY_OUTCOMES : GRIEVANCE_OUTCOMES;

  async function handleClose() {
    if (!outcome) {
      toast.error("Please select an outcome");
      return;
    }
    setLoading(true);
    const result = await closeCase(caseId, outcome);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Case closed");
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Close Case</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Case</DialogTitle>
          <DialogDescription>Select the outcome and close this case.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
              <SelectContent>
                {outcomes.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleClose} disabled={loading}>
              {loading ? "Closing..." : "Close Case"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
