import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HolidayCalculator } from "./holiday-calculator";

function calculateProRata(startDate: string, weeklyHours: number, fullTimeHours: number = 40): number {
  const start = new Date(startDate);
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);

  // UK statutory minimum: 5.6 weeks
  const fullEntitlement = 5.6 * (weeklyHours / fullTimeHours) * (fullTimeHours / 5);

  // If started this year, pro-rata
  if (start > yearStart) {
    const totalDaysInYear = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const daysWorked = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return Math.round((fullEntitlement * (daysWorked / totalDaysInYear)) * 10) / 10;
  }

  return Math.round(fullEntitlement * 10) / 10;
}

export default async function HolidaysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/onboarding");

  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", member.company_id)
    .eq("is_active", true)
    .order("last_name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Holiday Entitlements</h1>
        <p className="text-muted-foreground">Track holiday allowances and statutory compliance</p>
      </div>

      {/* Calculator */}
      <HolidayCalculator />

      {/* Employee Holiday Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Holiday Summary</CardTitle>
          <CardDescription>
            UK statutory minimum: 5.6 weeks (28 days for full-time). Includes bank holidays unless stated otherwise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hours/Week</TableHead>
                <TableHead>Entitlement</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees && employees.length > 0 ? (
                employees.map((emp) => {
                  const entitlement = emp.holiday_entitlement_days;
                  const used = emp.holiday_days_used;
                  const remaining = entitlement - used;
                  const proRataMin = calculateProRata(emp.start_date, emp.weekly_hours);
                  const isCompliant = entitlement >= proRataMin;
                  return (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.first_name} {emp.last_name}</TableCell>
                      <TableCell className="capitalize">{emp.employment_type.replace("_", " ")}</TableCell>
                      <TableCell>{emp.weekly_hours}</TableCell>
                      <TableCell>{entitlement} days</TableCell>
                      <TableCell>{used} days</TableCell>
                      <TableCell className={remaining < 5 ? "font-medium text-amber-700" : ""}>
                        {remaining} days
                      </TableCell>
                      <TableCell>
                        {isCompliant
                          ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Compliant</Badge>
                          : <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Below Minimum</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
