"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { adoptPolicy, updatePolicyStatus } from "@/lib/actions/policies";
import { toast } from "sonner";

export function AdoptPolicyButton({ templateId }: { templateId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleAdopt() {
    setLoading(true);
    const result = await adoptPolicy(templateId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Policy adopted as draft");
    }
    setLoading(false);
  }

  return (
    <Button onClick={handleAdopt} disabled={loading} size="sm">
      {loading ? "Adopting..." : "Adopt"}
    </Button>
  );
}

export function PolicyStatusButton({ policyId, status, label }: { policyId: string; status: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const result = await updatePolicyStatus(policyId, status);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Policy ${status === "active" ? "activated" : "archived"}`);
    }
    setLoading(false);
  }

  return (
    <Button onClick={handleUpdate} disabled={loading} size="sm" variant="outline">
      {loading ? "..." : label}
    </Button>
  );
}
