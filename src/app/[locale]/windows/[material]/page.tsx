import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getCategoryByMaterial, getSeoForPage, getSiteContent } from "@/lib/content";
import { isLocale } from "@/lib/routing";
import { buildLocaleAlternates, resolveLocale } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; material: string }>;
};

const materials = ["pvc", "wood", "aluminum"] as const;

export async function generateStaticParams() {
  return ["fr", "de"].flatMap((locale) =>
    materials.map((material) => ({ locale, material })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, material } = await params;
  const safeLocale = resolveLocale(locale);
  const content = await getSiteContent();
  const categorySlug = getCategoryByMaterial(material);
  const category = categorySlug
    ? content.categories.find((item) => item.slug === categorySlug)
    : undefined;
  const seo = getSeoForPage(
    safeLocale,
    category?.title[safeLocale],
    category?.description[safeLocale],
  );

  return {
    title: seo.title,
    description: seo.description,
    alternates: buildLocaleAlternates(
      safeLocale,
      (itemLocale) => `/${itemLocale}/windows/${material}`,
    ),
  };
}

export default async function MaterialCategoryPage({ params }: Props) {
  const { locale, material } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const categorySlug = getCategoryByMaterial(material);
  if (!categorySlug) {
    notFound();
  }

  const content = await getSiteContent();
  const category = content.categories.find((item) => item.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const products = content.products.filter(
    (product) => product.category === category.slug,
  );

  return (
    <>
      <section className="category-hero">
        <div className="container category-hero-grid">
          <div>
            <p className="eyebrow">
              {category.group === "windows"
                ? "Windows"
                : category.group === "doors"
                  ? "Doors"
                  : "Shutters"}
            </p>
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
    </>
  );
}
