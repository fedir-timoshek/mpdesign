import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { MobileStickyCta } from "@/components/mobile-sticky-cta";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteContent } from "@/lib/content";
import { contactConfig } from "@/lib/site-config";
import { isLocale } from "@/lib/routing";
import { Locale } from "@/types/content";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "de" }];
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = await getSiteContent();
  const hasShutters = content.categories.some((category) => category.slug === "shutters");

  return (
    <div className="site-shell">
      <SiteHeader locale={locale as Locale} showShutters={hasShutters} />
      <main>{children}</main>
      <SiteFooter locale={locale as Locale} />
      <MobileStickyCta locale={locale as Locale} contact={contactConfig} />
    </div>
  );
}
