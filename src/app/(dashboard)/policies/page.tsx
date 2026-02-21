import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadPolicyDialog } from "./upload-policy-dialog";
import { PolicyActions } from "./policy-actions";
import { AcknowledgementsDialog } from "./acknowledgements-dialog";
import type { CompanyPolicy, SubscriptionTier } from "@/lib/types/database";
import { canTrackAcknowledgements } from "@/lib/subscription";

function statusBadge(status: string) {
  switch (status) {
    case "active": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case "draft": return <Badge variant="outline">Draft</Badge>;
    case "archived": return <Badge variant="secondary">Archived</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function categoryLabel(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function PolicyTable({
  policies,
  tier,
  activeEmployeeCount,
  ackCounts,
}: {
  policies: CompanyPolicy[];
  tier: SubscriptionTier;
  activeEmployeeCount: number;
  ackCounts: Record<string, number>;
}) {
  const showAcks = canTrackAcknowledgements(tier);

  if (policies.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No policies in this tab.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Review Date</TableHead>
            {showAcks && <TableHead>Acknowledgements</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow key={policy.id}>
              <TableCell>
                <div>
                  <span className="font-medium">{policy.title}</span>
                  {policy.file_name && (
                    <span className="ml-2 text-xs text-muted-foreground">{policy.file_name}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{categoryLabel(policy.category)}</TableCell>
              <TableCell>{policy.version}</TableCell>
              <TableCell>
                {policy.review_date
                  ? new Date(policy.review_date).toLocaleDateString("en-GB")
                  : "—"}
              </TableCell>
              {showAcks && (
                <TableCell>
                  {policy.status === "active" && policy.requires_acknowledgement ? (
                    <AcknowledgementsDialog
                      policyId={policy.id}
                      policyTitle={policy.title}
                      ackCount={ackCounts[policy.id] ?? 0}
                      totalEmployees={activeEmployeeCount}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-right">
                <PolicyActions policy={policy} tier={tier} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function PoliciesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id, companies(subscription_tier)")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const company = member.companies as unknown as { subscription_tier: SubscriptionTier };
  const tier = company.subscription_tier;
  const companyId = member.company_id;

  // Fetch policies, employee count, and acknowledgement counts in parallel
  const [
    { data: allPolicies },
    { count: activeEmployeeCount },
    { data: ackRows },
  ] = await Promise.all([
    supabase
      .from("company_policies")
      .select("*")
      .eq("company_id", companyId)
      .order("title"),
    supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_active", true),
    supabase
      .from("policy_acknowledgements")
      .select("policy_id")
      .eq("company_id", companyId),
  ]);

  const policies = (allPolicies ?? []) as CompanyPolicy[];
  const activePolicies = policies.filter((p) => p.status === "active");
  const draftPolicies = policies.filter((p) => p.status === "draft");
  const archivedPolicies = policies.filter((p) => p.status === "archived");

  // Build ack counts per policy
  const ackCounts: Record<string, number> = {};
  (ackRows ?? []).forEach((row) => {
    ackCounts[row.policy_id] = (ackCounts[row.policy_id] ?? 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Policies</h1>
          <p className="text-muted-foreground">Upload, manage, and distribute your HR policies</p>
        </div>
        <UploadPolicyDialog />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activePolicies.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftPolicies.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedPolicies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <PolicyTable
            policies={activePolicies}
            tier={tier}
            activeEmployeeCount={activeEmployeeCount ?? 0}
            ackCounts={ackCounts}
          />
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <PolicyTable
            policies={draftPolicies}
            tier={tier}
            activeEmployeeCount={activeEmployeeCount ?? 0}
            ackCounts={ackCounts}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <PolicyTable
            policies={archivedPolicies}
            tier={tier}
            activeEmployeeCount={activeEmployeeCount ?? 0}
            ackCounts={ackCounts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
