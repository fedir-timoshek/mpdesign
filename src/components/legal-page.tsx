import { notFound } from "next/navigation";
import { getSiteContent, getSeoForPage } from "@/lib/content";
import { isLocale } from "@/lib/routing";
import { Locale } from "@/types/content";

type Props = {
  locale: string;
  slug: "impressum" | "datenschutz" | "cookies";
};

export async function resolveLegalPage({ locale, slug }: Props) {
  if (!isLocale(locale)) {
    notFound();
  }

  const content = await getSiteContent();
  const page = content.legal[locale as Locale].find((item) => item.slug === slug);

  if (!page) {
    notFound();
  }

  return {
    locale: locale as Locale,
    page,
    seo: getSeoForPage(locale as Locale, page.title, page.intro),
  };
}
