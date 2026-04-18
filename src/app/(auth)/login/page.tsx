"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/actions/auth";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-input-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "2rem",
        }}
      >
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-brand-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="text-center">
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.375rem",
                color: "var(--color-text-primary)",
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                marginTop: "0.25rem",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Sign in to your Cendrixa account
            </p>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div
              style={{
                backgroundColor: "var(--color-danger-light)",
                border: "1px solid rgba(196,57,45,0.2)",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem",
                fontSize: "0.875rem",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@company.co.uk"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-brand-primary)",
                }}
                className="hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "0.25rem",
              fontWeight: 600,
              fontSize: "0.9375rem",
              color: "#ffffff",
              backgroundColor: loading
                ? "var(--color-bg-tertiary)"
                : "var(--color-brand-primary)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.625rem 1rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p
          style={{
            marginTop: "1.25rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              fontWeight: 600,
              color: "var(--color-brand-primary)",
            }}
            className="hover:underline"
          >
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
