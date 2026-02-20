"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AcknowledgeButton({ alertId, companyId }: { alertId: string; companyId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAcknowledge() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("alert_acknowledgements").insert({
      alert_id: alertId,
      company_id: companyId,
      acknowledged_by: user?.id ?? null,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Alert acknowledged");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button size="sm" variant="outline" onClick={handleAcknowledge} disabled={loading}>
      {loading ? "..." : "Acknowledge"}
    </Button>
  );
}
