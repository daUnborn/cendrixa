"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SECTORS = [
  { value: "care_homes", label: "Care Homes" },
  { value: "hospitality", label: "Hospitality" },
  { value: "recruitment", label: "Recruitment" },
  { value: "construction", label: "Construction" },
  { value: "retail", label: "Retail" },
  { value: "professional_services", label: "Professional Services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const EMPLOYEE_RANGES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-30", label: "11-30 employees" },
  { value: "31-50", label: "31-50 employees" },
  { value: "51-100", label: "51-100 employees" },
  { value: "100+", label: "100+ employees" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("Checking session...");
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setDebugInfo(`❌ Session error: ${error.message}`);
        return;
      }

      if (!session) {
        setDebugInfo("⚠️ No session found - redirecting to login");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setDebugInfo(`✅ Logged in as ${user?.email || 'unknown'}`);
      setSessionChecked(true);
    }

    checkSession();
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    console.log('=== ONBOARDING DEBUG START ===');

    // Get session first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('1. Session check:', { sessionData, sessionError });

    if (!sessionData.session) {
      setError("No session found. Please sign in again.");
      setDebugInfo("❌ No session - please sign out and sign in again");
      setLoading(false);
      return;
    }

    setDebugInfo(`Session: ${sessionData.session ? 'EXISTS' : 'NONE'}`);

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('2. User check:', { user, userError });

    if (!user) {
      const errorMsg = `Not authenticated. Session: ${sessionData.session ? 'exists but no user' : 'missing'}`;
      console.error('AUTH FAILED:', errorMsg);
      setError(errorMsg);
      setDebugInfo(`❌ ${errorMsg}`);
      setLoading(false);
      return;
    }

    setDebugInfo(`✅ User: ${user.email} (${user.id.substring(0, 8)}...)`);
    console.log('3. User metadata:', user.user_metadata);
    console.log('4. Session token exists:', !!sessionData.session?.access_token);

    // Create company
    console.log('5. Attempting company insert...');
    const companyData = {
      name: formData.get("companyName") as string,
      sector: formData.get("sector") as string,
      employee_count_range: formData.get("employeeRange") as string,
    };
    console.log('Company data:', companyData);

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert(companyData)
      .select()
      .single();

    console.log('6. Company insert result:', { company, companyError });

    if (companyError) {
      const fullError = `Company insert failed: ${companyError.message} (Code: ${companyError.code}, Details: ${companyError.details})`;
      console.error('COMPANY ERROR:', companyError);
      setError(fullError);
      setDebugInfo(`❌ ${fullError}`);
      setLoading(false);
      return;
    }

    console.log('7. Company created successfully:', company.id);

    // Add user as owner
    const { error: memberError } = await supabase
      .from("company_members")
      .insert({
        company_id: company.id,
        user_id: user.id,
        role: "owner",
        first_name: user.user_metadata.first_name || "Admin",
        last_name: user.user_metadata.last_name || "",
      });

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Set up your company</CardTitle>
          <CardDescription>
            Tell us about your business so we can customise your compliance experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Button type="button" variant="outline" onClick={handleSignOut} size="sm">
              Sign Out
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {debugInfo && (
              <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">{debugInfo}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" name="companyName" required placeholder="Acme Ltd" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select name="sector" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeRange">Number of employees</Label>
              <Select name="employeeRange" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up..." : "Continue to dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
