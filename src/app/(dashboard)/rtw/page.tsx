import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { AddRtwDialog } from "./add-rtw-dialog";

function statusBadge(status: string) {
  switch (status) {
    case "valid": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="mr-1 h-3 w-3" />Valid</Badge>;
    case "expiring_soon": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><Clock className="mr-1 h-3 w-3" />Expiring Soon</Badge>;
    case "expired": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="mr-1 h-3 w-3" />Expired</Badge>;
    default: return <Badge variant="outline">Pending Review</Badge>;
  }
}

export default async function RtwPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: checks } = await supabase
    .from("rtw_checks")
    .select("*, employees(first_name, last_name)")
    .eq("company_id", member.company_id)
    .order("created_at", { ascending: false });

  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name")
    .eq("company_id", member.company_id)
    .eq("is_active", true)
    .order("last_name");

  const expired = checks?.filter(c => c.status === "expired").length ?? 0;
  const expiring = checks?.filter(c => c.status === "expiring_soon").length ?? 0;
  const valid = checks?.filter(c => c.status === "valid").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Right to Work</h1>
          <p className="text-muted-foreground">Track and manage employee right-to-work checks</p>
        </div>
        <AddRtwDialog employees={employees ?? []} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Valid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiring}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Checks Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Check Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks && checks.length > 0 ? (
              checks.map((check) => {
                const emp = check.employees as unknown as { first_name: string; last_name: string } | null;
                return (
                  <TableRow key={check.id}>
                    <TableCell className="font-medium">
                      {emp ? `${emp.first_name} ${emp.last_name}` : "—"}
                    </TableCell>
                    <TableCell className="capitalize">{check.document_type.replace(/_/g, " ")}</TableCell>
                    <TableCell>{check.document_reference || check.share_code || "—"}</TableCell>
                    <TableCell>{new Date(check.check_date).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>
                      {check.expiry_date ? new Date(check.expiry_date).toLocaleDateString("en-GB") : "No expiry"}
                    </TableCell>
                    <TableCell>{statusBadge(check.status)}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No right-to-work checks recorded yet. Add your first check.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
