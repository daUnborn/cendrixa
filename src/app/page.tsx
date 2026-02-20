import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Scale, Calendar, Bell, Users } from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Right-to-Work Tracking",
    description: "Track employee documents, expiry dates, and share codes. Never miss a check.",
  },
  {
    icon: Scale,
    title: "Disciplinary & Grievance",
    description: "Step-by-step workflows with audit trails for tribunal protection.",
  },
  {
    icon: Users,
    title: "Policy Management",
    description: "UK-compliant policy templates customised to your sector and company size.",
  },
  {
    icon: Calendar,
    title: "Holiday Compliance",
    description: "Pro-rata calculations, part-time entitlements, and statutory compliance.",
  },
  {
    icon: Bell,
    title: "Legal Change Alerts",
    description: "Stay ahead of employment law changes that affect your business.",
  },
  {
    icon: Shield,
    title: "Compliance Dashboard",
    description: "Red/Amber/Green risk overview across all HR compliance areas.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-bold">Cendrixa</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Start free trial</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          UK HR Compliance
          <br />
          <span className="text-muted-foreground">Made Simple</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          The all-in-one platform for UK SMEs to manage right-to-work checks, HR policies,
          disciplinary processes, and stay compliant with employment law.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">Start 14-day free trial</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Sign in</Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No credit card required. From &pound;99/month after trial.
        </p>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold">Everything you need to stay compliant</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Built specifically for UK SMEs in care homes, hospitality, recruitment, and construction.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-lg border bg-card p-6">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold">Simple, transparent pricing</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            <div className="rounded-lg border p-8">
              <h3 className="text-lg font-semibold">Starter</h3>
              <p className="mt-2 text-sm text-muted-foreground">For small teams up to 30 employees</p>
              <p className="mt-6">
                <span className="text-4xl font-bold">&pound;99</span>
                <span className="text-muted-foreground">/month</span>
              </p>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full">Start free trial</Button>
              </Link>
              <ul className="mt-8 space-y-3 text-sm">
                <li>Up to 30 employees</li>
                <li>Compliance dashboard</li>
                <li>Right-to-work tracking</li>
                <li>Policy template library</li>
                <li>Basic workflows</li>
                <li>Email support</li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-primary p-8">
              <h3 className="text-lg font-semibold">Professional</h3>
              <p className="mt-2 text-sm text-muted-foreground">For growing teams up to 100 employees</p>
              <p className="mt-6">
                <span className="text-4xl font-bold">&pound;149</span>
                <span className="text-muted-foreground">/month</span>
              </p>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full">Start free trial</Button>
              </Link>
              <ul className="mt-8 space-y-3 text-sm">
                <li>Up to 100 employees</li>
                <li>Everything in Starter</li>
                <li>Legal change alerts</li>
                <li>Contract management</li>
                <li>Holiday calculator</li>
                <li>Audit trail export</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Cendrixa. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
