import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Chromium/Puppeteer from bundling - required for serverless PDF generation
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
