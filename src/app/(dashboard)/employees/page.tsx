import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { EmployeeStatusFilter } from "./employee-status-filter";
import type { EmployeeStatus } from "@/lib/types/database";

function rtwBadge(status: string) {
  switch (status) {
    case "valid": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>;
    case "expiring_soon": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Expiring</Badge>;
    case "expired": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
    default: return <Badge variant="outline">Pending</Badge>;
  }
}

function statusBadge(status: EmployeeStatus) {
  switch (status) {
    case "active": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case "on_probation": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">On Probation</Badge>;
    case "on_leave": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">On Leave</Badge>;
    case "suspended": return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Suspended</Badge>;
    case "terminated": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Terminated</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

const VALID_STATUSES: EmployeeStatus[] = ["active", "on_probation", "on_leave", "suspended", "terminated"];

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const activeStatus: EmployeeStatus | "all" =
    statusParam && VALID_STATUSES.includes(statusParam as EmployeeStatus)
      ? (statusParam as EmployeeStatus)
      : "all";

  let query = supabase
    .from("employees")
    .select("*")
    .eq("company_id", member.company_id)
    .order("last_name");

  if (activeStatus === "all") {
    query = query.neq("status", "terminated");
  } else {
    query = query.eq("status", activeStatus);
  }

  const { data: employees } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">{employees?.length ?? 0} employee{employees?.length !== 1 ? "s" : ""}</p>
        </div>
        <AddEmployeeDialog />
      </div>

      <EmployeeStatusFilter currentStatus={activeStatus} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>RTW</TableHead>
              <TableHead>Start Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees && employees.length > 0 ? (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">
                    <Link href={`/employees/${emp.id}`} className="hover:underline">
                      {emp.first_name} {emp.last_name}
                    </Link>
                  </TableCell>
                  <TableCell>{emp.job_title || "—"}</TableCell>
                  <TableCell>{emp.department || "—"}</TableCell>
                  <TableCell className="capitalize">{emp.employment_type.replace(/_/g, " ")}</TableCell>
                  <TableCell>{statusBadge(emp.status as EmployeeStatus)}</TableCell>
                  <TableCell>{rtwBadge(emp.rtw_status)}</TableCell>
                  <TableCell>{new Date(emp.start_date).toLocaleDateString("en-GB")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {activeStatus === "all"
                    ? "No employees yet. Add your first employee to get started."
                    : `No employees with status "${activeStatus.replace(/_/g, " ")}".`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
