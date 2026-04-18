"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/auth";
import { Shield } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await resetPassword(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
    setLoading(false);
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
              Reset password
            </h1>
            <p
              style={{
                marginTop: "0.25rem",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Enter your email to receive a reset link
            </p>
          </div>
        </div>

        {success ? (
          <div className="space-y-4">
            <div
              style={{
                backgroundColor: "var(--color-success-light)",
                border: "1px solid rgba(45,122,79,0.2)",
                borderRadius: "var(--radius-sm)",
                padding: "0.75rem",
                fontSize: "0.875rem",
                color: "var(--color-success)",
              }}
            >
              {success}
            </div>
            <Link
              href="/login"
              style={{
                display: "block",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "0.9375rem",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-input-border)",
                borderRadius: "var(--radius-sm)",
                padding: "0.625rem 1rem",
              }}
              className="hover:border-[var(--color-text-secondary)] transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
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
              {loading ? "Sending…" : "Send reset link"}
            </button>
            <Link
              href="/login"
              style={{
                display: "block",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
              className="hover:underline"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
