import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Codex in-app preview reaches the local server through 127.0.0.1.
  // Explicitly allow that development origin so React can hydrate interactive
  // controls such as onboarding, drills, and course navigation.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
