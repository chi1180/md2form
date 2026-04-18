import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  isProduction
    ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: https://www.google-analytics.com",
  "font-src 'self' data:",
  isProduction
    ? "connect-src 'self' https: https://www.google-analytics.com https://region1.google-analytics.com"
    : "connect-src 'self' https: ws: wss: https://www.google-analytics.com https://region1.google-analytics.com",
  "frame-src 'self' https:",
  isProduction ? "upgrade-insecure-requests" : null,
]
  .filter(Boolean)
  .join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
