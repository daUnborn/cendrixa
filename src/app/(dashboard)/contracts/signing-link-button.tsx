"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check, Loader2 } from "lucide-react";
import { generateSigningLink } from "@/lib/actions/contracts";
import { toast } from "sonner";

interface Props {
  contractId: string;
  signingStatus: string;
  existingToken: string | null;
}

export function SigningLinkButton({ contractId, signingStatus, existingToken }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (signingStatus === "signed") return;

    // If there's already a pending token, just copy it
    if (existingToken && signingStatus === "pending") {
      const url = `${window.location.origin}/sign/${existingToken}`;
      await navigator.clipboard.writeText(url);
      toast.success("Signing link copied to clipboard");
      return;
    }

    setLoading(true);
    const result = await generateSigningLink(contractId);
    if (result.error) {
      toast.error(result.error);
    } else if (result.token) {
      const url = `${window.location.origin}/sign/${result.token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Signing link generated and copied to clipboard");
    }
    setLoading(false);
  }

  if (signingStatus === "signed") {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-green-700">
        <Check className="h-3.5 w-3.5" />Signed
      </span>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <><Link2 className="mr-1 h-3.5 w-3.5" />{signingStatus === "pending" ? "Copy Link" : "Get Link"}</>
      )}
    </Button>
  );
}
