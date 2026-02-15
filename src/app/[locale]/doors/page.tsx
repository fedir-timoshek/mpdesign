import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadSection } from "@/components/lead-section";
import { ProductCard } from "@/components/product-card";
import { getSeoForPage, getSiteContent } from "@/lib/content";
import { isLocale } from "@/lib/routing";
import { buildLocaleAlternates, buildSocialMetadata, resolveLocale } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "de" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = resolveLocale(locale);
  const content = await getSiteContent();
  const category = content.categories.find((item) => item.slug === "doors");
  const seo = getSeoForPage(
    safeLocale,
    category?.title[safeLocale],
    category?.description[safeLocale],
  );
  const social = buildSocialMetadata(
    safeLocale,
    seo.title,
    seo.description,
    category?.heroImage.src,
  );

  return {
    title: seo.title,
    description: seo.description,
    alternates: buildLocaleAlternates(safeLocale, (itemLocale) => `/${itemLocale}/doors`),
    ...social,
  };
}

export default async function DoorsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const content = await getSiteContent();
  const category = content.categories.find((item) => item.slug === "doors");

  if (!category) {
    notFound();
  }

  const products = content.products.filter((product) => product.category === "doors");

  return (
    <>
      <section className="category-hero">
        <div className="container category-hero-grid">
          <div>
            <p className="eyebrow">Doors</p>
            <h1>{category.title[locale]}</h1>
            <p>{category.subtitle[locale]}</p>
            <p>{category.description[locale]}</p>
          </div>
          <div className="category-hero-media">
            <img src={category.heroImage.src} alt={category.heroImage.alt[locale]} />
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container cards-grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <LeadSection locale={locale} sourcePage={`/${locale}/doors`} />
    </>
  );
}
