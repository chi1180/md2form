import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION ?? "NO_TOKEN";

const GAID = process.env.GAID;

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Md2Form",
  description:
    "Write forms in Markdown, share instantly, and analyze responses.",
  keywords: ["form", "markdown", "share", "analyze"],
  verification: {
    google: googleVerification,
  },
  openGraph: {
    type: "website",
    url: defaultUrl,
    title: "Md2Form",
    description:
      "Write forms in Markdown, share instantly, and analyze responses.",
  },
};

const InterFont = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

const Noto_SansFont = Noto_Sans({
  variable: "--font-noto-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${InterFont.className} ${Noto_SansFont.className} ${InterFont.variable} ${Noto_SansFont.variable} antialiased`}
        style={{
          fontFamily: `var(--font-inter), var(--font-noto-sans), system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        {GAID && <GoogleAnalytics gaId={GAID} />}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
