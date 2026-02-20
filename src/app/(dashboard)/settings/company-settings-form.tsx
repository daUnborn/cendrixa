"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export function CompanySettingsForm({ company }: { company: Record<string, unknown> }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("companies").update({
      name: form.get("name") as string,
      sector: form.get("sector") as string,
      address_line1: form.get("address1") as string || null,
      city: form.get("city") as string || null,
      postcode: form.get("postcode") as string || null,
      phone: form.get("phone") as string || null,
    }).eq("id", company.id as string);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Company settings updated");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
        <CardDescription>Update your company information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input name="name" defaultValue={company.name as string} required />
          </div>
          <div className="space-y-2">
            <Label>Sector</Label>
            <Select name="sector" defaultValue={company.sector as string}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SECTORS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input name="address1" defaultValue={(company.address_line1 as string) || ""} placeholder="Street address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input name="city" defaultValue={(company.city as string) || ""} />
            </div>
            <div className="space-y-2">
              <Label>Postcode</Label>
              <Input name="postcode" defaultValue={(company.postcode as string) || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input name="phone" defaultValue={(company.phone as string) || ""} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
