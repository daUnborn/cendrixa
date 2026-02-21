import type { SubscriptionTier } from "@/lib/types/database";

export function canDistributePolicies(tier: SubscriptionTier): boolean {
  return tier !== "starter";
}

export function canTrackAcknowledgements(tier: SubscriptionTier): boolean {
  return tier !== "starter";
}

export function canExportAcknowledgements(tier: SubscriptionTier): boolean {
  return tier === "enterprise";
}

export function getPolicyLimit(tier: SubscriptionTier): number {
  return tier === "starter" ? 10 : Infinity;
}
