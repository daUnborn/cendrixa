import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .eq("company_id", member.company_id)
    .single();

  if (!employee) notFound();

  const [{ data: rtwChecks }, { data: contracts }, { data: cases }] = await Promise.all([
    supabase.from("rtw_checks").select("*").eq("employee_id", id).order("check_date", { ascending: false }),
    supabase.from("contracts").select("*").eq("employee_id", id).order("start_date", { ascending: false }),
    supabase.from("cases").select("*").eq("employee_id", id).order("opened_date", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{employee.first_name} {employee.last_name}</h1>
        <p className="text-muted-foreground">{employee.job_title || "No title"} — {employee.department || "No department"}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Employment Type</CardTitle></CardHeader>
          <CardContent><p className="capitalize font-medium">{employee.employment_type.replace("_", " ")}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Start Date</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{new Date(employee.start_date).toLocaleDateString("en-GB")}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">RTW Status</CardTitle></CardHeader>
          <CardContent>
            <Badge className={
              employee.rtw_status === "valid" ? "bg-green-100 text-green-800" :
              employee.rtw_status === "expired" ? "bg-red-100 text-red-800" :
              "bg-amber-100 text-amber-800"
            }>
              {employee.rtw_status.replace("_", " ")}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Holiday</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{employee.holiday_entitlement_days - employee.holiday_days_used} days remaining</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rtw">
        <TabsList>
          <TabsTrigger value="rtw">RTW Checks ({rtwChecks?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="contracts">Contracts ({contracts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="cases">Cases ({cases?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="rtw" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Check Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rtwChecks?.map(check => (
                <TableRow key={check.id}>
                  <TableCell className="capitalize">{check.document_type.replace(/_/g, " ")}</TableCell>
                  <TableCell>{check.document_reference || check.share_code || "—"}</TableCell>
                  <TableCell>{new Date(check.check_date).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>{check.expiry_date ? new Date(check.expiry_date).toLocaleDateString("en-GB") : "—"}</TableCell>
                  <TableCell>
                    <Badge className={check.status === "valid" ? "bg-green-100 text-green-800" : check.status === "expired" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>
                      {check.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!rtwChecks || rtwChecks.length === 0) && (
                <TableRow><TableCell colSpan={5} className="py-4 text-center text-muted-foreground">No checks recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Current</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts?.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="capitalize">{c.contract_type.replace("_", " ")}</TableCell>
                  <TableCell>{new Date(c.start_date).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>{c.end_date ? new Date(c.end_date).toLocaleDateString("en-GB") : "—"}</TableCell>
                  <TableCell>{c.weekly_hours ?? "—"}</TableCell>
                  <TableCell>{c.is_current ? <Badge className="bg-green-100 text-green-800">Yes</Badge> : "No"}</TableCell>
                </TableRow>
              ))}
              {(!contracts || contracts.length === 0) && (
                <TableRow><TableCell colSpan={5} className="py-4 text-center text-muted-foreground">No contracts recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opened</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases?.map(c => (
                <TableRow key={c.id}>
                  <TableCell><Link href={`/cases/${c.id}`} className="font-mono hover:underline">{c.case_reference}</Link></TableCell>
                  <TableCell className="capitalize">{c.case_type}</TableCell>
                  <TableCell>{c.subject}</TableCell>
                  <TableCell className="capitalize">{c.status}</TableCell>
                  <TableCell>{new Date(c.opened_date).toLocaleDateString("en-GB")}</TableCell>
                </TableRow>
              ))}
              {(!cases || cases.length === 0) && (
                <TableRow><TableCell colSpan={5} className="py-4 text-center text-muted-foreground">No cases recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
