"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { EmployeeStatus } from "@/lib/types/database";

const FILTERS: { value: EmployeeStatus | "all"; label: string }[] = [
  { value: "all", label: "All Active" },
  { value: "active", label: "Active" },
  { value: "on_probation", label: "On Probation" },
  { value: "on_leave", label: "On Leave" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Terminated" },
];

export function EmployeeStatusFilter({
  currentStatus,
}: {
  currentStatus: EmployeeStatus | "all";
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleFilter(value: EmployeeStatus | "all") {
    const params = new URLSearchParams();
    if (value !== "all") params.set("status", value);
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(f => (
        <Button
          key={f.value}
          variant={currentStatus === f.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilter(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
