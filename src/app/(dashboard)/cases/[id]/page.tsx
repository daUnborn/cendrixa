import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle } from "lucide-react";
import { StepCompleteButton, CloseCaseButton } from "./case-actions";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: caseData } = await supabase
    .from("cases")
    .select("*, employees(first_name, last_name)")
    .eq("id", id)
    .eq("company_id", member.company_id)
    .single();

  if (!caseData) notFound();

  const { data: steps } = await supabase
    .from("case_steps")
    .select("*")
    .eq("case_id", id)
    .order("step_number");

  const emp = caseData.employees as unknown as { first_name: string; last_name: string } | null;
  const allStepsComplete = steps?.every(s => s.is_completed) ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{caseData.case_reference}</h1>
            <Badge variant="outline" className="capitalize">{caseData.case_type}</Badge>
            <Badge variant={caseData.status === "closed" ? "secondary" : "default"} className="capitalize">
              {caseData.status}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {emp ? `${emp.first_name} ${emp.last_name}` : "Unknown"} — {caseData.subject}
          </p>
        </div>
        {caseData.status !== "closed" && allStepsComplete && (
          <CloseCaseButton caseId={id} caseType={caseData.case_type} />
        )}
      </div>

      {caseData.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{caseData.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>Complete each step in order to ensure compliance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps?.map((step, index) => {
              const isNext = !step.is_completed && (index === 0 || steps[index - 1].is_completed);
              return (
                <div key={step.id}>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {step.is_completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className={`h-6 w-6 ${isNext ? "text-primary" : "text-muted-foreground/40"}`} />
                      )}
                      {index < steps.length - 1 && (
                        <div className={`mt-1 h-full w-px ${step.is_completed ? "bg-green-500" : "bg-muted"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${step.is_completed ? "text-green-700" : isNext ? "" : "text-muted-foreground"}`}>
                            Step {step.step_number}: {step.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {isNext && caseData.status !== "closed" && (
                          <StepCompleteButton stepId={step.id} caseId={id} />
                        )}
                      </div>
                      {step.is_completed && step.completed_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Completed {new Date(step.completed_at).toLocaleDateString("en-GB")}
                          {step.notes && ` — ${step.notes}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
