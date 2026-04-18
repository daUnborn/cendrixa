"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Pencil, FileText, Briefcase, ClipboardList, ShieldCheck } from "lucide-react";
import { updateEmployeeStatus } from "@/lib/actions/employees";
import { toast } from "sonner";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { RequestDocumentDialog } from "./request-document-dialog";
import type { Employee, EmployeeStatus } from "@/lib/types/database";

const STATUS_CONFIG: Record<EmployeeStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  on_probation: { label: "On Probation", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  on_leave: { label: "On Leave", className: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
  suspended: { label: "Suspended", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
  terminated: { label: "Terminated", className: "bg-red-100 text-red-800 hover:bg-red-100" },
};

const STATUSES: EmployeeStatus[] = ["active", "on_probation", "on_leave", "suspended", "terminated"];

export function EmployeeProfileHeader({
  employee,
  onStartCase,
  onAddContract,
  onRecordRtw,
}: {
  employee: Employee;
  onStartCase: () => void;
  onAddContract: () => void;
  onRecordRtw: () => void;
}) {
  const [currentStatus, setCurrentStatus] = useState<EmployeeStatus>(employee.status ?? "active");
  const [editOpen, setEditOpen] = useState(false);
  const [requestDocOpen, setRequestDocOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function handleStatusChange(status: EmployeeStatus) {
    if (status === currentStatus) return;
    setUpdatingStatus(true);
    const result = await updateEmployeeStatus(employee.id, status);
    if (result?.error) {
      toast.error(result.error);
    } else {
      setCurrentStatus(status);
      toast.success(`Status updated to ${STATUS_CONFIG[status].label}`);
    }
    setUpdatingStatus(false);
  }

  const statusCfg = STATUS_CONFIG[currentStatus];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{employee.first_name} {employee.last_name}</h1>
            {/* Status badge — clickable dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button disabled={updatingStatus} className="inline-flex items-center gap-1 focus:outline-none">
                  <Badge className={`${statusCfg.className} cursor-pointer flex items-center gap-1`}>
                    {statusCfg.label}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Change status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUSES.map(s => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={s === currentStatus ? "font-medium" : ""}
                  >
                    <Badge className={`${STATUS_CONFIG[s].className} mr-2`}>{STATUS_CONFIG[s].label}</Badge>
                    {s === currentStatus && <span className="text-xs text-muted-foreground ml-auto">Current</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground">
            {employee.job_title || "No title"}
            {employee.department ? ` — ${employee.department}` : ""}
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRequestDocOpen(true)}>
            <FileText className="h-3.5 w-3.5 mr-1" /> Request Document
          </Button>
          <Button variant="outline" size="sm" onClick={onRecordRtw}>
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Record RTW
          </Button>
          <Button variant="outline" size="sm" onClick={onAddContract}>
            <Briefcase className="h-3.5 w-3.5 mr-1" /> Add Contract
          </Button>
          <Button variant="outline" size="sm" onClick={onStartCase}>
            <ClipboardList className="h-3.5 w-3.5 mr-1" /> Start Case
          </Button>
        </div>
      </div>

      <EditEmployeeDialog employee={employee} open={editOpen} onOpenChange={setEditOpen} />
      <RequestDocumentDialog
        employeeId={employee.id}
        employeeName={`${employee.first_name} ${employee.last_name}`}
        open={requestDocOpen}
        onOpenChange={setRequestDocOpen}
      />
    </>
  );
}
