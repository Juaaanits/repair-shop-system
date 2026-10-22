import type { NextConfig } from "next";

// Keep the project-owned AGENTS.md intact when running the development server.
const config: NextConfig = { agentRules: false };
export default config;
