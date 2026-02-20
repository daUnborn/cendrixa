import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, Bell } from "lucide-react";
import { AcknowledgeButton } from "./acknowledge-button";

function severityConfig(severity: string) {
  switch (severity) {
    case "critical": return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-800" };
    case "warning": return { icon: Bell, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-800" };
    default: return { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-800" };
  }
}

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const [{ data: alerts }, { data: acknowledgements }] = await Promise.all([
    supabase.from("legal_alerts").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("alert_acknowledgements").select("alert_id").eq("company_id", member.company_id),
  ]);

  const acknowledgedIds = new Set(acknowledgements?.map(a => a.alert_id) ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Legal Alerts</h1>
        <p className="text-muted-foreground">Stay updated with UK employment law changes that affect your business</p>
      </div>

      {alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const config = severityConfig(alert.severity);
            const Icon = config.icon;
            const isAcknowledged = acknowledgedIds.has(alert.id);
            return (
              <Card key={alert.id} className={config.bg}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 ${config.color}`} />
                      <div>
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                        <CardDescription className="mt-1">{alert.summary}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${config.badge} hover:${config.badge}`}>
                        {alert.severity}
                      </Badge>
                      {isAcknowledged ? (
                        <Badge variant="secondary">Acknowledged</Badge>
                      ) : (
                        <AcknowledgeButton alertId={alert.id} companyId={member.company_id} />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {alert.detail && (
                  <CardContent>
                    <p className="text-sm">{alert.detail}</p>
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      {alert.effective_date && <span>Effective: {new Date(alert.effective_date).toLocaleDateString("en-GB")}</span>}
                      {alert.source_url && (
                        <a href={alert.source_url} target="_blank" rel="noopener noreferrer" className="underline">
                          Source
                        </a>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No active legal alerts at this time.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
