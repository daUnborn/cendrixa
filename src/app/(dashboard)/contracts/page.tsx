import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddContractDialog } from "./add-contract-dialog";

function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return date <= thirtyDays && date >= new Date();
}

function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*, employees(first_name, last_name)")
    .eq("company_id", member.company_id)
    .eq("is_current", true)
    .order("created_at", { ascending: false });

  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name")
    .eq("company_id", member.company_id)
    .eq("is_active", true)
    .order("last_name");

  const expiring = contracts?.filter(c => isExpiringSoon(c.renewal_date) || isExpiringSoon(c.end_date)).length ?? 0;
  const probationEnding = contracts?.filter(c => isExpiringSoon(c.probation_end_date)).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Track employee contracts, renewals, and probation periods</p>
        </div>
        <AddContractDialog employees={employees ?? []} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Contracts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{contracts?.length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-amber-700">Expiring Soon</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{expiring}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-700">Probation Ending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{probationEnding}</div></CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End/Renewal</TableHead>
              <TableHead>Probation</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts && contracts.length > 0 ? (
              contracts.map((c) => {
                const emp = c.employees as unknown as { first_name: string; last_name: string } | null;
                const renewalOrEnd = c.renewal_date || c.end_date;
                const expiringSoon = isExpiringSoon(renewalOrEnd);
                const expired = isExpired(renewalOrEnd);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : "—"}</TableCell>
                    <TableCell className="capitalize">{c.contract_type.replace("_", " ")}</TableCell>
                    <TableCell>{new Date(c.start_date).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>{renewalOrEnd ? new Date(renewalOrEnd).toLocaleDateString("en-GB") : "—"}</TableCell>
                    <TableCell>{c.probation_end_date ? new Date(c.probation_end_date).toLocaleDateString("en-GB") : "—"}</TableCell>
                    <TableCell>{c.weekly_hours ?? "—"}</TableCell>
                    <TableCell>
                      {expired ? <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>
                        : expiringSoon ? <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Expiring</Badge>
                        : <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No contracts recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
