"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link2, Check, Loader2, Mail, Copy, ChevronDown } from "lucide-react";
import { generateSigningLink, generateAndSendSigningLink } from "@/lib/actions/contracts";
import { toast } from "sonner";

interface Props {
  contractId: string;
  signingStatus: string;
  existingToken: string | null;
}

export function SigningLinkButton({ contractId, signingStatus, existingToken }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleCopyLink() {
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

  async function handleSendEmail() {
    if (signingStatus === "signed") return;

    setLoading(true);
    const result = await generateAndSendSigningLink(contractId, 'email');
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(`Signing link sent via email to ${result.recipientEmail}`);
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Link2 className="mr-1 h-3.5 w-3.5" />
              {signingStatus === "pending" ? "Send Link" : "Get Link"}
              <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSendEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Send via Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
