"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  activatePolicy,
  archivePolicy,
  deletePolicy,
  reactivatePolicy,
  regenerateAccessToken,
  replaceFile,
} from "@/lib/actions/policies";
import { toast } from "sonner";
import { MoreHorizontal, Check, Archive, Trash2, Link2, RefreshCw, Upload, RotateCcw, Loader2 } from "lucide-react";
import type { CompanyPolicy, SubscriptionTier } from "@/lib/types/database";
import { canDistributePolicies } from "@/lib/subscription";
import { EditPolicyDialog } from "./edit-policy-dialog";

export function PolicyActions({
  policy,
  tier,
}: {
  policy: CompanyPolicy;
  tier: SubscriptionTier;
}) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAction(action: () => Promise<{ error?: string; success?: boolean }>, successMsg: string) {
    setLoading(true);
    const result = await action();
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(successMsg);
    }
    setLoading(false);
  }

  function copyLink() {
    if (!canDistributePolicies(tier)) {
      toast.error("Upgrade to Professional to distribute policies");
      return;
    }
    const url = `${window.location.origin}/policy/${policy.access_token}`;
    navigator.clipboard.writeText(url);
    toast.success("Policy link copied to clipboard");
  }

  async function handleReplaceFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    await handleAction(() => replaceFile(policy.id, formData), "File replaced");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="flex items-center gap-1">
      <EditPolicyDialog policy={policy} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {policy.status === "draft" && (
            <>
              <DropdownMenuItem onClick={() => handleAction(() => activatePolicy(policy.id), "Policy activated")}>
                <Check className="mr-2 h-4 w-4" />Activate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleAction(() => deletePolicy(policy.id), "Policy deleted")}
              >
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </DropdownMenuItem>
            </>
          )}

          {policy.status === "active" && (
            <>
              <DropdownMenuItem onClick={copyLink}>
                <Link2 className="mr-2 h-4 w-4" />Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />Replace File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction(() => regenerateAccessToken(policy.id), "Access token regenerated — old links are now invalid")}>
                <RefreshCw className="mr-2 h-4 w-4" />Regenerate Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction(() => archivePolicy(policy.id), "Policy archived")}>
                <Archive className="mr-2 h-4 w-4" />Archive
              </DropdownMenuItem>
            </>
          )}

          {policy.status === "archived" && (
            <DropdownMenuItem onClick={() => handleAction(() => reactivatePolicy(policy.id), "Policy moved to drafts")}>
              <RotateCcw className="mr-2 h-4 w-4" />Reactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input for replace */}
      <Input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleReplaceFile}
      />
    </div>
  );
}
