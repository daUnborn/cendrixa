import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Scale, FileText, ClipboardList, Calendar, Bell, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

type ComplianceLevel = "compliant" | "at_risk" | "non_compliant";

function statusColor(status: ComplianceLevel) {
  switch (status) {
    case "compliant": return "bg-green-500";
    case "at_risk": return "bg-amber-500";
    case "non_compliant": return "bg-red-500";
  }
}

function statusBadge(status: ComplianceLevel) {
  switch (status) {
    case "compliant": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Green</Badge>;
    case "at_risk": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Amber</Badge>;
    case "non_compliant": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Red</Badge>;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user's company
  const { data: member } = await supabase
    .from("company_members")
    .select("*, companies(*)")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const company = (member as Record<string, unknown>).companies as Record<string, unknown>;
  const companyId = company.id as string;

  // Fetch all stats in parallel
  const [
    { count: totalEmployees },
    { count: activeEmployees },
    { data: rtwExpiring },
    { count: openCases },
    { data: contractsExpiring },
    { count: activePolicies },
    { count: policiesNeedReview },
    { data: unacknowledgedAlerts },
  ] = await Promise.all([
    supabase.from("employees").select("*", { count: "exact", head: true }).eq("company_id", companyId),
    supabase.from("employees").select("*", { count: "exact", head: true }).eq("company_id", companyId).eq("is_active", true),
    supabase.from("rtw_checks").select("id").eq("company_id", companyId).in("status", ["expired", "expiring_soon"]),
    supabase.from("cases").select("*", { count: "exact", head: true }).eq("company_id", companyId).neq("status", "closed"),
    supabase.from("contracts").select("id").eq("company_id", companyId).eq("is_current", true).not("renewal_date", "is", null),
    supabase.from("company_policies").select("*", { count: "exact", head: true }).eq("company_id", companyId).eq("status", "active"),
    supabase.from("company_policies").select("*", { count: "exact", head: true }).eq("company_id", companyId).eq("needs_update", true),
    supabase.from("legal_alerts").select("id").eq("is_active", true),
  ]);

  const rtwIssues = rtwExpiring?.length ?? 0;
  const contractIssues = contractsExpiring?.length ?? 0;
  const alertCount = unacknowledgedAlerts?.length ?? 0;

  // Calculate compliance areas
  const rtwStatus: ComplianceLevel = rtwIssues === 0 ? "compliant" : rtwIssues <= 2 ? "at_risk" : "non_compliant";
  const policyStatus: ComplianceLevel = (policiesNeedReview ?? 0) === 0 ? "compliant" : "at_risk";
  const caseStatus: ComplianceLevel = (openCases ?? 0) === 0 ? "compliant" : "at_risk";
  const contractStatus: ComplianceLevel = contractIssues === 0 ? "compliant" : contractIssues <= 2 ? "at_risk" : "non_compliant";

  const areas = [
    { title: "Right to Work", status: rtwStatus, issues: rtwIssues, icon: FileCheck, href: "/rtw", description: `${rtwIssues} checks need attention` },
    { title: "Policies", status: policyStatus, issues: policiesNeedReview ?? 0, icon: FileText, href: "/policies", description: `${policiesNeedReview ?? 0} policies need review` },
    { title: "Cases", status: caseStatus, issues: openCases ?? 0, icon: Scale, href: "/cases", description: `${openCases ?? 0} open cases` },
    { title: "Contracts", status: contractStatus, issues: contractIssues, icon: ClipboardList, href: "/contracts", description: `${contractIssues} contracts expiring soon` },
  ];

  const overallStatus: ComplianceLevel = areas.some(a => a.status === "non_compliant")
    ? "non_compliant"
    : areas.some(a => a.status === "at_risk")
      ? "at_risk"
      : "compliant";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{company.name as string}</h1>
        <p className="text-muted-foreground">Compliance Dashboard</p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className={`h-16 w-16 rounded-full ${statusColor(overallStatus)} flex items-center justify-center`}>
            {overallStatus === "compliant" ? (
              <FileCheck className="h-8 w-8 text-white" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              Overall Compliance: {statusBadge(overallStatus)}
            </h2>
            <p className="text-muted-foreground">
              {overallStatus === "compliant"
                ? "All compliance areas are green. Keep up the good work."
                : overallStatus === "at_risk"
                  ? "Some areas need attention. Review the items below."
                  : "Urgent action required. Non-compliant areas detected."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees ?? 0}</div>
            <p className="text-xs text-muted-foreground">{totalEmployees ?? 0} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolicies ?? 0}</div>
            <p className="text-xs text-muted-foreground">{policiesNeedReview ?? 0} need review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCases ?? 0}</div>
            <p className="text-xs text-muted-foreground">Disciplinary &amp; grievance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Legal Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertCount}</div>
            <p className="text-xs text-muted-foreground">Unacknowledged</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Areas */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Compliance Areas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {areas.map((area) => (
            <Link key={area.title} href={area.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${statusColor(area.status)}`} />
                  <div className="flex-1">
                    <CardTitle className="text-base">{area.title}</CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </div>
                  <area.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
