"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  FileText,
  Scale,
  Calendar,
  Bell,
  Settings,
  Shield,
  ClipboardList,
  ScrollText,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Employees", href: "/employees", icon: Users },
  { title: "Right to Work", href: "/rtw", icon: FileCheck },
  { title: "Policies", href: "/policies", icon: FileText },
  { title: "Cases", href: "/cases", icon: Scale },
  { title: "Contracts", href: "/contracts", icon: ClipboardList },
  { title: "Holidays", href: "/holidays", icon: Calendar },
];

const secondaryNav = [
  { title: "Legal Alerts", href: "/alerts", icon: Bell },
  { title: "Audit Trail", href: "/audit", icon: ScrollText },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-surface)",
        borderRight: "1px solid var(--color-input-border)",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.25rem 1rem",
          borderBottom: "1px solid var(--color-input-border)",
          flexShrink: 0,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-brand-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: "var(--color-text-primary)",
            }}
          >
            Cendrixa
          </span>
        </Link>
      </div>

      {/* Nav groups */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0.75rem 0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <NavGroup label="Compliance" items={mainNav} pathname={pathname} />
        <NavGroup label="System" items={secondaryNav} pathname={pathname} />
      </nav>

      {/* Sign out */}
      <div
        style={{
          padding: "0.75rem 0.5rem",
          borderTop: "1px solid var(--color-input-border)",
          flexShrink: 0,
        }}
      >
        <form action={signOut}>
          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              transition: "background-color 0.1s, color 0.1s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--color-bg-secondary)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--color-text-secondary)";
            }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { title: string; href: string; icon: React.ElementType }[];
  pathname: string;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-text-tertiary)",
          padding: "0 0.75rem",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 500,
                  color: active
                    ? "var(--color-brand-primary)"
                    : "var(--color-text-secondary)",
                  backgroundColor: active
                    ? "var(--color-brand-light)"
                    : "transparent",
                  textDecoration: "none",
                  transition: "background-color 0.1s, color 0.1s",
                }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
