import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdoptPolicyButton, PolicyStatusButton } from "./policy-actions";

function statusBadge(status: string) {
  switch (status) {
    case "active": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case "draft": return <Badge variant="outline">Draft</Badge>;
    case "needs_review": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Needs Review</Badge>;
    case "archived": return <Badge variant="secondary">Archived</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default async function PoliciesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id, companies(sector)")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const [{ data: templates }, { data: companyPolicies }] = await Promise.all([
    supabase.from("policy_templates").select("*").order("category, title"),
    supabase.from("company_policies")
      .select("*")
      .eq("company_id", member.company_id)
      .order("title"),
  ]);

  const adoptedTemplateIds = new Set(companyPolicies?.map(p => p.template_id) ?? []);

  // Group templates by category
  const categories = new Map<string, typeof templates>();
  templates?.forEach((t) => {
    const existing = categories.get(t.category) ?? [];
    existing.push(t);
    categories.set(t.category, existing);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Policies</h1>
        <p className="text-muted-foreground">Manage your HR policies and adopt templates</p>
      </div>

      <Tabs defaultValue="my-policies">
        <TabsList>
          <TabsTrigger value="my-policies">My Policies ({companyPolicies?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="templates">Template Library ({templates?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="my-policies" className="mt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Adopted</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyPolicies && companyPolicies.length > 0 ? (
                  companyPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.title}</TableCell>
                      <TableCell>{statusBadge(policy.status)}</TableCell>
                      <TableCell>{policy.version}</TableCell>
                      <TableCell>
                        {policy.adopted_date ? new Date(policy.adopted_date).toLocaleDateString("en-GB") : "—"}
                      </TableCell>
                      <TableCell>
                        {policy.review_date ? new Date(policy.review_date).toLocaleDateString("en-GB") : "—"}
                      </TableCell>
                      <TableCell>
                        {policy.status === "draft" && (
                          <PolicyStatusButton policyId={policy.id} status="active" label="Activate" />
                        )}
                        {policy.status === "active" && (
                          <PolicyStatusButton policyId={policy.id} status="archived" label="Archive" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No policies adopted yet. Browse the template library to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6 space-y-6">
          {Array.from(categories.entries()).map(([category, categoryTemplates]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category.replace(/_/g, " ")}</CardTitle>
                <CardDescription>{categoryTemplates!.length} templates available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryTemplates!.map((template) => (
                    <div key={template.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{template.title}</p>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="mt-1 flex gap-2">
                          {template.is_mandatory && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Mandatory</Badge>
                          )}
                          <Badge variant="outline">v{template.version}</Badge>
                        </div>
                      </div>
                      {adoptedTemplateIds.has(template.id) ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Adopted</Badge>
                      ) : (
                        <AdoptPolicyButton templateId={template.id} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {categories.size === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No policy templates available yet. Templates will be added soon.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
