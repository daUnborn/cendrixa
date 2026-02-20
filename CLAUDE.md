# Cendrixa — UK HR Compliance SaaS

## Project Context
- **Product:** Cendrixa — UK HR compliance platform for SMEs (10-100 staff)
- **Target:** UK SMEs without full-time HR (care homes, hospitality, recruitment, construction)
- **Revenue goal:** £10k/month (£99-149/month per customer, ~70-100 customers)
- **Product owner:** User (business direction). **Tech co-founder:** Claude (code & architecture).

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (Postgres + Auth + Edge Functions + Row Level Security)
- **Hosting:** Vercel (frontend) + Supabase (backend)
- **Payments:** Stripe (GBP, UK-focused)
- **Email:** Resend
- **Legal templates:** Licensed content loaded from structured JSON/DB format

## Architecture Decisions
- All prices in GBP (£)
- Multi-tenant: each company is a tenant, RLS enforced at DB level
- Role-based access: Owner, Admin, Manager, Viewer
- Audit trail on all compliance-critical actions
- UK employment law focus only (no US/EU)

## Feature Set (Full Build)
### Core
1. **Compliance Dashboard** — RAG (Red/Amber/Green) risk overview per company
2. **Right-to-Work Tracking** — Employee RTW document tracking, expiry alerts, share codes
3. **Policy Template Library** — Licensed UK-compliant templates, customisable by sector/size
4. **Disciplinary & Grievance Workflows** — Step-by-step guided process with audit trail

### Advanced
5. **Auto-Updating Templates** — Flag when law changes affect existing policies
6. **Legal Change Alerts** — Upcoming UK employment law changes notifications
7. **Contract Management** — Renewal tracking, probation period reminders
8. **Holiday Entitlement Calculator** — Pro-rata, part-time, statutory compliance
9. **Tribunal Protection Audit Trail** — Exportable compliance evidence pack

## Pricing Tiers (Planned)
- **Starter (£99/month):** Up to 30 employees, core features
- **Professional (£149/month):** Up to 100 employees, all features
- **Enterprise (custom):** 100+ employees, dedicated support

## Development Rules
- Always use TypeScript strict mode
- Use Supabase RLS for all data access — never trust client-side auth alone
- All dates in ISO 8601, displayed in UK format (DD/MM/YYYY)
- Use server components by default, client components only when needed
- Stripe webhooks for payment state — never trust client-side payment status
- Every compliance action must create an audit log entry
- Mobile-responsive from day one

## File Structure
```
/src
  /app          — Next.js app router pages
  /components   — Reusable UI components
  /lib          — Utilities, Supabase client, types
  /hooks        — Custom React hooks
/supabase
  /migrations   — SQL migration files
  /seed         — Seed data for development
```

## Current Status
- [ ] Project scaffolding
- [ ] Supabase setup
- [ ] Auth (signup/login/org creation)
- [ ] Database schema
- [ ] Compliance dashboard
- [ ] RTW tracking
- [ ] Policy templates
- [ ] Disciplinary/grievance workflows
- [ ] Contract management
- [ ] Holiday calculator
- [ ] Legal alerts
- [ ] Stripe billing
- [ ] Audit trail & export
