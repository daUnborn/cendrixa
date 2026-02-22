import type { NextConfig } from "next";
import { execSync } from "child_process";

const getGitSha = () => {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try { return execSync("git rev-parse --short HEAD").toString().trim(); }
  catch { return "dev"; }
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_SHA: getGitSha(),
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || "development",
  },
};

export default nextConfig;
