"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Acknowledgement {
  id: string;
  signer_name: string;
  signer_email: string | null;
  employee_id: string | null;
  ip_address: string | null;
  acknowledged_at: string;
}

export function AcknowledgementsDialog({
  policyId,
  policyTitle,
  ackCount,
  totalEmployees,
}: {
  policyId: string;
  policyTitle: string;
  ackCount: number;
  totalEmployees: number;
}) {
  const [open, setOpen] = useState(false);
  const [acks, setAcks] = useState<Acknowledgement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("policy_acknowledgements")
      .select("id, signer_name, signer_email, employee_id, ip_address, acknowledged_at")
      .eq("policy_id", policyId)
      .order("acknowledged_at", { ascending: false })
      .then(({ data }) => {
        setAcks(data ?? []);
        setLoading(false);
      });
  }, [open, policyId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="font-mono text-xs">
          {ackCount}/{totalEmployees}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Acknowledgements — {policyTitle}</DialogTitle>
          <DialogDescription>
            {ackCount} of {totalEmployees} employees have acknowledged this policy.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : acks.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No acknowledgements yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acks.map((ack) => (
                  <TableRow key={ack.id}>
                    <TableCell className="font-medium">{ack.signer_name}</TableCell>
                    <TableCell>{ack.signer_email ?? "—"}</TableCell>
                    <TableCell>
                      {new Date(ack.acknowledged_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{ack.ip_address ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
