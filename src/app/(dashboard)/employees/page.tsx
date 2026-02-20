import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AddEmployeeDialog } from "./add-employee-dialog";

function rtwBadge(status: string) {
  switch (status) {
    case "valid": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>;
    case "expiring_soon": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Expiring</Badge>;
    case "expired": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
    default: return <Badge variant="outline">Pending</Badge>;
  }
}

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", member.company_id)
    .eq("is_active", true)
    .order("last_name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">{employees?.length ?? 0} active employees</p>
        </div>
        <AddEmployeeDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>RTW Status</TableHead>
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
                  <TableCell className="capitalize">{emp.employment_type.replace("_", " ")}</TableCell>
                  <TableCell>{rtwBadge(emp.rtw_status)}</TableCell>
                  <TableCell>{new Date(emp.start_date).toLocaleDateString("en-GB")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No employees yet. Add your first employee to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
