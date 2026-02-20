import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { CreateCaseDialog } from "./create-case-dialog";

function statusBadge(status: string) {
  switch (status) {
    case "open": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
    case "investigation": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Investigation</Badge>;
    case "hearing": return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Hearing</Badge>;
    case "appeal": return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Appeal</Badge>;
    case "closed": return <Badge variant="secondary">Closed</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function typeBadge(type: string) {
  return type === "disciplinary"
    ? <Badge variant="outline" className="border-red-200 text-red-800">Disciplinary</Badge>
    : <Badge variant="outline" className="border-blue-200 text-blue-800">Grievance</Badge>;
}

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: cases } = await supabase
    .from("cases")
    .select("*, employees(first_name, last_name)")
    .eq("company_id", member.company_id)
    .order("created_at", { ascending: false });

  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, last_name")
    .eq("company_id", member.company_id)
    .eq("is_active", true)
    .order("last_name");

  const openCases = cases?.filter(c => c.status !== "closed").length ?? 0;
  const closedCases = cases?.filter(c => c.status === "closed").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground">Manage disciplinary and grievance cases</p>
        </div>
        <CreateCaseDialog employees={employees ?? []} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Closed Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedCases}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opened</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases && cases.length > 0 ? (
              cases.map((c) => {
                const emp = c.employees as unknown as { first_name: string; last_name: string } | null;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">
                      <Link href={`/cases/${c.id}`} className="hover:underline">{c.case_reference}</Link>
                    </TableCell>
                    <TableCell>{emp ? `${emp.first_name} ${emp.last_name}` : "—"}</TableCell>
                    <TableCell>{typeBadge(c.case_type)}</TableCell>
                    <TableCell>{c.subject}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell>{new Date(c.opened_date).toLocaleDateString("en-GB")}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No cases yet. Create a case when needed.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
