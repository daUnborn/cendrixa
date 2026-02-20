"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function HolidayCalculator() {
  const [result, setResult] = useState<{
    entitlement: number;
    proRata: number;
    statutory: number;
  } | null>(null);

  function calculate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const weeklyHours = parseFloat(form.get("hours") as string) || 40;
    const daysPerWeek = parseFloat(form.get("daysPerWeek") as string) || 5;
    const startDate = form.get("startDate") as string;
    const includesBankHols = form.get("bankHolidays") === "included";

    // UK statutory: 5.6 weeks
    const weeklyEntitlement = 5.6 * daysPerWeek;
    const statutory = Math.min(weeklyEntitlement, 28); // Capped at 28 days

    let proRata = statutory;
    if (startDate) {
      const start = new Date(startDate);
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      if (start > yearStart) {
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
        const remaining = (yearEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        proRata = Math.round((statutory * (remaining / totalDays)) * 10) / 10;
      }
    }

    setResult({
      entitlement: statutory,
      proRata,
      statutory,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holiday Calculator</CardTitle>
        <CardDescription>Calculate statutory holiday entitlement based on working pattern.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={calculate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Hours per week</Label>
            <Input name="hours" type="number" step="0.5" defaultValue="40" />
          </div>
          <div className="space-y-2">
            <Label>Days per week</Label>
            <Select name="daysPerWeek" defaultValue="5">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <SelectItem key={d} value={String(d)}>{d} day{d > 1 ? "s" : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start date (for pro-rata)</Label>
            <Input name="startDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label>Bank holidays</Label>
            <Select name="bankHolidays" defaultValue="included">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="included">Included in entitlement</SelectItem>
                <SelectItem value="additional">Additional to entitlement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button type="submit">Calculate</Button>
          </div>
        </form>
        {result && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground">Full Year Entitlement</p>
              <p className="text-3xl font-bold">{result.entitlement}</p>
              <p className="text-sm text-muted-foreground">days</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground">Pro-Rata (This Year)</p>
              <p className="text-3xl font-bold">{result.proRata}</p>
              <p className="text-sm text-muted-foreground">days</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground">Statutory Minimum</p>
              <p className="text-3xl font-bold">{result.statutory}</p>
              <p className="text-sm text-muted-foreground">days (5.6 weeks)</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
