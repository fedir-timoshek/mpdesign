import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
import { getPublicSiteUrl } from "@/lib/site-url";
import "./globals.css";

const deployEnv = process.env.SITE_DEPLOY_ENV || "production";
const isStaging = deployEnv === "staging";

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  title: "MPDESIGN",
  description: "Fenetres et portes premium en Suisse.",
  robots: isStaging ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: {
    title: "MPDESIGN",
    description: "Fenetres et portes premium en Suisse.",
    type: "website",
    images: [{ url: "/brand/logo.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MPDESIGN",
    description: "Fenetres et portes premium en Suisse.",
    images: ["/brand/logo.jpg"],
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  const cloudflareToken = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
  const resolvedParams = params ? await params : {};
  const htmlLang = resolvedParams?.locale === "de" ? "de" : "fr";

  return (
    <html lang={htmlLang}>
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        {children}
        {cloudflareToken ? (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token":"${cloudflareToken}"}`}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
