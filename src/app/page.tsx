import Link from "next/link";
import {
  Shield,
  FileCheck,
  Scale,
  Calendar,
  Bell,
  Users,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "Right-to-Work Tracking",
    description:
      "Track employee documents, expiry dates, and share codes. Never miss a check.",
  },
  {
    icon: Scale,
    title: "Disciplinary & Grievance",
    description:
      "Step-by-step workflows with full audit trails for tribunal protection.",
  },
  {
    icon: Users,
    title: "Policy Management",
    description:
      "UK-compliant policy templates customised to your sector and company size.",
  },
  {
    icon: Calendar,
    title: "Holiday Compliance",
    description:
      "Pro-rata calculations, part-time entitlements, and statutory compliance.",
  },
  {
    icon: Bell,
    title: "Legal Change Alerts",
    description:
      "Stay ahead of employment law changes that affect your business.",
  },
  {
    icon: Shield,
    title: "Compliance Dashboard",
    description:
      "Red/Amber/Green risk overview across all HR compliance areas at a glance.",
  },
];

const steps = [
  {
    number: "01",
    title: "Set up your company",
    description:
      "Add your employees, upload existing policies, and configure your compliance baseline in minutes.",
  },
  {
    number: "02",
    title: "Get your compliance score",
    description:
      "Cendrixa instantly flags gaps — expired RTW documents, unsigned policies, open cases — in a single dashboard.",
  },
  {
    number: "03",
    title: "Stay compliant automatically",
    description:
      "Automated alerts keep you ahead of renewals, legal changes, and upcoming deadlines before they become problems.",
  },
];

const starterFeatures = [
  "Up to 30 employees",
  "Compliance dashboard",
  "Right-to-work tracking",
  "Policy template library",
  "Basic workflows",
  "Email support",
];

const proFeatures = [
  "Up to 100 employees",
  "Everything in Starter",
  "Legal change alerts",
  "Contract management",
  "Holiday calculator",
  "Audit trail export",
  "Priority support",
];

export default function HomePage() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}
    >
      {/* ─── Nav ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-input-border)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-brand-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "var(--color-text-primary)",
              }}
            >
              Cendrixa
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              How it works
            </a>
            <a
              href="#pricing"
              style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                padding: "0.375rem 0.75rem",
                borderRadius: "var(--radius-sm)",
              }}
              className="hover:text-[var(--color-text-primary)] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "var(--color-brand-primary)",
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
              className="hover:bg-[var(--color-brand-hover)] transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "var(--color-brand-light)",
                color: "var(--color-brand-primary)",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0.25rem 0.75rem",
                borderRadius: "var(--radius-full)",
                marginBottom: "1.5rem",
              }}
            >
              <Shield className="h-3 w-3" />
              UK HR Compliance Platform
            </div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
              }}
            >
              HR Compliance.
              <br />
              <span style={{ color: "var(--color-brand-primary)" }}>
                Made simple.
              </span>
            </h1>
            <p
              style={{
                marginTop: "1.25rem",
                fontSize: "1.125rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                maxWidth: "38rem",
              }}
            >
              The all-in-one platform for UK SMEs to manage right-to-work
              checks, HR policies, disciplinary processes, and stay ahead of
              employment law.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                style={{
                  fontWeight: 600,
                  color: "#ffffff",
                  backgroundColor: "var(--color-brand-primary)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9375rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                className="hover:bg-[var(--color-brand-hover)] transition-colors"
              >
                Start 14-day free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                style={{
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  backgroundColor: "transparent",
                  border: "1px solid var(--color-input-border)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9375rem",
                }}
                className="hover:border-[var(--color-text-secondary)] transition-colors"
              >
                Sign in
              </Link>
            </div>
            <p
              style={{
                marginTop: "0.875rem",
                fontSize: "0.8125rem",
                color: "var(--color-text-tertiary)",
              }}
            >
              No credit card required · From £99/month after trial
            </p>
          </div>

          {/* Mock compliance dashboard card */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-input-border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              padding: "1.5rem",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                }}
              >
                Compliance Overview
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                47 employees
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Right to Work", status: "green", pct: 94, text: "44 / 47 valid" },
                { label: "Signed Policies", status: "amber", pct: 72, text: "34 / 47 signed" },
                { label: "Open Cases", status: "red", pct: 100, count: "3 open", alert: true },
                { label: "Contracts on file", status: "green", pct: 100, text: "All complete" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color:
                          row.status === "green"
                            ? "var(--color-success)"
                            : row.status === "amber"
                            ? "var(--color-warning)"
                            : "var(--color-danger)",
                        backgroundColor:
                          row.status === "green"
                            ? "var(--color-success-light)"
                            : row.status === "amber"
                            ? "var(--color-warning-light)"
                            : "var(--color-danger-light)",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      {row.text ?? row.count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--color-bg-secondary)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${row.pct}%`,
                        borderRadius: "var(--radius-full)",
                        backgroundColor:
                          row.status === "green"
                            ? "var(--color-success)"
                            : row.status === "amber"
                            ? "var(--color-warning)"
                            : "var(--color-danger)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem",
                backgroundColor: "var(--color-warning-light)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(184,134,11,0.2)",
              }}
            >
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-warning)",
                  fontWeight: 500,
                }}
              >
                ⚠ 2 right-to-work documents expire within 30 days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{ borderTop: "1px solid var(--color-input-border)", backgroundColor: "var(--color-bg-secondary)" }}
        className="py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 700,
              }}
            >
              Up and running in minutes
            </h2>
            <p
              style={{
                marginTop: "0.75rem",
                color: "var(--color-text-secondary)",
                maxWidth: "36rem",
                margin: "0.75rem auto 0",
              }}
            >
              No HR consultants required. Cendrixa guides you through every step.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "var(--color-brand-primary)",
                    opacity: 0.25,
                    lineHeight: 1,
                    marginBottom: "0.75rem",
                  }}
                >
                  {step.number}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 700,
              }}
            >
              Everything you need to stay compliant
            </h2>
            <p
              style={{
                marginTop: "0.75rem",
                color: "var(--color-text-secondary)",
                maxWidth: "36rem",
                margin: "0.75rem auto 0",
              }}
            >
              Built specifically for UK SMEs in care, hospitality, recruitment,
              and construction.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-input-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-brand-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <feature.icon
                    className="h-5 w-5"
                    style={{ color: "var(--color-brand-primary)" }}
                  />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "1rem",
                    marginBottom: "0.375rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonial ─────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid var(--color-input-border)",
          borderBottom: "1px solid var(--color-input-border)",
          backgroundColor: "var(--color-brand-light)",
        }}
        className="py-16"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              lineHeight: 1.6,
            }}
          >
            &ldquo;We used to spend half a day every month chasing RTW renewals.
            Cendrixa automated all of it — we haven&apos;t had a lapsed document
            since we switched.&rdquo;
          </p>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-brand-primary)",
            }}
          >
            Sarah M. · HR Manager, care home group (East Midlands)
          </p>
        </div>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 700,
              }}
            >
              Simple, transparent pricing
            </h2>
            <p
              style={{
                marginTop: "0.75rem",
                color: "var(--color-text-secondary)",
              }}
            >
              14-day free trial on all plans. No credit card required.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-3xl gap-6 md:grid-cols-2">
            {/* Starter */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-input-border)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                }}
              >
                Starter
              </h3>
              <p
                style={{
                  marginTop: "0.375rem",
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                For small teams up to 30 employees
              </p>
              <p className="mt-6">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                  }}
                >
                  £99
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    marginLeft: "0.25rem",
                  }}
                >
                  /month
                </span>
              </p>
              <Link
                href="/signup"
                style={{
                  display: "block",
                  marginTop: "1.25rem",
                  textAlign: "center",
                  fontWeight: 600,
                  color: "var(--color-brand-primary)",
                  backgroundColor: "var(--color-brand-light)",
                  padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9375rem",
                }}
                className="hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                Start free trial
              </Link>
              <ul className="mt-6 space-y-2.5">
                {starterFeatures.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0"
                      style={{ color: "var(--color-success)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Professional */}
            <div
              style={{
                backgroundColor: "var(--color-brand-primary)",
                border: "2px solid var(--color-brand-primary)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                boxShadow: "var(--shadow-lg)",
                color: "#ffffff",
              }}
            >
              <div className="flex items-center justify-between">
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                  }}
                >
                  Professional
                </h3>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: "0.1875rem 0.5rem",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  Most popular
                </span>
              </div>
              <p
                style={{
                  marginTop: "0.375rem",
                  fontSize: "0.875rem",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                For growing teams up to 100 employees
              </p>
              <p className="mt-6">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                  }}
                >
                  £149
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.7)",
                    marginLeft: "0.25rem",
                  }}
                >
                  /month
                </span>
              </p>
              <Link
                href="/signup"
                style={{
                  display: "block",
                  marginTop: "1.25rem",
                  textAlign: "center",
                  fontWeight: 600,
                  color: "var(--color-brand-primary)",
                  backgroundColor: "#ffffff",
                  padding: "0.625rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9375rem",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                Start free trial
              </Link>
              <ul className="mt-6 space-y-2.5">
                {proFeatures.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderTop: "1px solid var(--color-input-border)",
        }}
        className="py-20"
      >
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
            }}
          >
            Start your free trial today
          </h2>
          <p
            style={{
              marginTop: "0.75rem",
              color: "var(--color-text-secondary)",
              fontSize: "1rem",
            }}
          >
            14 days free. No credit card. Cancel anytime.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              style={{
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "var(--color-brand-primary)",
                padding: "0.75rem 1.75rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9375rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              className="hover:bg-[var(--color-brand-hover)] transition-colors"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--color-input-border)",
          backgroundColor: "var(--color-surface)",
        }}
        className="py-8"
      >
        <div
          className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6"
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-brand-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "0.9375rem",
              }}
            >
              Cendrixa
            </span>
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-tertiary)",
            }}
          >
            &copy; {new Date().getFullYear()} Cendrixa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
