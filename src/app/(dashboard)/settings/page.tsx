import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanySettingsForm } from "./company-settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("*, companies(*)")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const company = (member as Record<string, unknown>).companies as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company and subscription settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CompanySettingsForm company={company} />

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan</span>
              <Badge className="capitalize">{company.subscription_tier as string}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={company.subscription_status === "active" ? "default" : "outline"} className="capitalize">
                {company.subscription_status as string}
              </Badge>
            </div>
            {Boolean(company.trial_ends_at) && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trial ends</span>
                <span className="text-sm">{new Date(company.trial_ends_at as string).toLocaleDateString("en-GB")}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Billing management will be available through Stripe once configured.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Role</span>
              <Badge className="capitalize">{member.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Name</span>
              <span className="text-sm">{member.first_name} {member.last_name}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
