import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { getSignedUrl } from "@/lib/supabase/storage";
import { EmployeeProfileHeader } from "./employee-profile-header";
import { DocumentsTab } from "./documents-tab";
import type { DocumentRequest, DocumentRequestItem } from "@/lib/types/database";

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

  const [
    { data: rtwChecksRaw },
    { data: contracts },
    { data: cases },
    { data: docRequestsRaw },
  ] = await Promise.all([
    supabase.from("rtw_checks").select("*").eq("employee_id", id).order("check_date", { ascending: false }),
    supabase.from("contracts").select("*").eq("employee_id", id).order("start_date", { ascending: false }),
    supabase.from("cases").select("*").eq("employee_id", id).order("opened_date", { ascending: false }),
    supabase
      .from("document_requests")
      .select("*, document_request_items(*)")
      .eq("employee_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const rtwChecks = await Promise.all(
    (rtwChecksRaw ?? []).map(async (check) => ({
      ...check,
      signedUrl: check.document_url ? await getSignedUrl(check.document_url) : null,
    }))
  );

  // Resolve signed URLs for uploaded document items
  const docRequests = await Promise.all(
    (docRequestsRaw ?? []).map(async (req) => {
      const items = await Promise.all(
        ((req.document_request_items ?? []) as DocumentRequestItem[]).map(async (item) => ({
          ...item,
          signedUrl: item.file_path ? await getSignedUrl(item.file_path) : null,
        }))
      );
      return { ...(req as DocumentRequest), items };
    })
  );

  const employeeName = `${employee.first_name} ${employee.last_name}`;

  return (
    <div className="space-y-6">
      {/* Header with status & quick actions */}
      <EmployeeProfileHeader
        employee={employee}
        onStartCase={() => {}}
        onAddContract={() => {}}
        onRecordRtw={() => {}}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Employment Type</CardTitle></CardHeader>
          <CardContent><p className="capitalize font-medium">{employee.employment_type.replace(/_/g, " ")}</p></CardContent>
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
              {employee.rtw_status.replace(/_/g, " ")}
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

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Documents ({docRequests.length})</TabsTrigger>
          <TabsTrigger value="rtw">RTW Checks ({rtwChecks.length})</TabsTrigger>
          <TabsTrigger value="contracts">Contracts ({contracts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="cases">Cases ({cases?.length ?? 0})</TabsTrigger>
        </TabsList>

        {/* Documents tab */}
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab
            employeeId={employee.id}
            employeeName={employeeName}
            requests={docRequests}
          />
        </TabsContent>

        {/* RTW tab */}
        <TabsContent value="rtw" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Check Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rtwChecks.map(check => (
                <TableRow key={check.id}>
                  <TableCell className="capitalize">{check.document_type.replace(/_/g, " ")}</TableCell>
                  <TableCell>{check.document_reference || check.share_code || "—"}</TableCell>
                  <TableCell>{new Date(check.check_date).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>{check.expiry_date ? new Date(check.expiry_date).toLocaleDateString("en-GB") : "—"}</TableCell>
                  <TableCell>
                    {check.signedUrl ? (
                      <a href={check.signedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View</a>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={check.status === "valid" ? "bg-green-100 text-green-800" : check.status === "expired" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>
                      {check.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rtwChecks.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-4 text-center text-muted-foreground">No RTW checks recorded</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Contracts tab */}
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
                  <TableCell className="capitalize">{c.contract_type.replace(/_/g, " ")}</TableCell>
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

        {/* Cases tab */}
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
