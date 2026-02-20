"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Company, CompanyMember } from "@/lib/types/database";

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [member, setMember] = useState<CompanyMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompany() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: memberData } = await supabase
        .from("company_members")
        .select("*, companies(*)")
        .eq("user_id", user.id)
        .single();

      if (memberData) {
        setMember(memberData as unknown as CompanyMember);
        setCompany((memberData as Record<string, unknown>).companies as unknown as Company);
      }
      setLoading(false);
    }

    fetchCompany();
  }, []);

  return { company, member, loading };
}
