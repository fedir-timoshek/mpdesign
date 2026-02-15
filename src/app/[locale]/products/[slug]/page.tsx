import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/lead-form";
import { ProductExperience } from "@/components/product-experience";
import { getCategoryPath, getSeoForPage, getSiteContent } from "@/lib/content";
import { isLocale } from "@/lib/routing";
import { buildLocaleAlternates, buildSocialMetadata, resolveLocale } from "@/lib/seo";
import { localizedCategoryInfo } from "@/lib/site-config";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const content = await getSiteContent();
  return ["fr", "de"].flatMap((locale) =>
    content.products.map((product) => ({ locale, slug: product.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = resolveLocale(locale);
  const content = await getSiteContent();
  const product = content.products.find((item) => item.slug === slug);
  const seo = getSeoForPage(
    safeLocale,
    product?.title[safeLocale],
    product?.summary[safeLocale],
  );
  const social = buildSocialMetadata(
    safeLocale,
    seo.title,
    seo.description,
    product?.heroImage.src,
  );

  return {
    title: seo.title,
    description: seo.description,
    alternates: buildLocaleAlternates(
      safeLocale,
      (itemLocale) => `/${itemLocale}/products/${slug}`,
    ),
    ...social,
    openGraph: {
      ...social.openGraph,
      images: product
        ? [
            {
              url: product.heroImage.src,
              alt: product.heroImage.alt[safeLocale],
            },
          ]
        : social.openGraph.images,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = await getSiteContent();
  const product = content.products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const category = content.categories.find((item) => item.slug === product.category);
  const categoryPath = getCategoryPath(product.category, locale);
  const labels = localizedCategoryInfo[locale];

  return (
    <>
      <section className="product-hero">
        <div className="container product-hero-grid">
          <ProductExperience
            locale={locale}
            gallery={product.gallery}
            colorPalette={product.colorPalette}
            documents={product.documents}
          />

          <div className="product-intro">
            <p className="eyebrow">{category?.title[locale]}</p>
            <h1>{product.title[locale]}</h1>
            <p className="product-subtitle">{product.subtitle[locale]}</p>
            <p>{product.summary[locale]}</p>
            <div className="product-actions">
              <a
                href="#lead-form"
                className="btn btn-primary"
                data-mpdesign-cta="1"
                data-mpdesign-cta-channel="form"
                data-mpdesign-cta-placement="product_hero"
              >
                {product.ctaLabel[locale]}
              </a>
              <Link href={categoryPath} className="btn btn-ghost">
                {labels.cardAction}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container specs-section">
          <h2>{labels.specsTitle}</h2>
          <div className="specs-grid">
            {product.specs.map((spec) => (
              <article key={`${spec.label.fr}-${spec.value.fr}`} className="spec-card">
                <p>{spec.label[locale]}</p>
                <h3>{spec.value[locale]}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container features-section">
          <h2>{labels.featuresTitle}</h2>
          <ul>
            {product.features[locale].map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-contact">
        <div className="container contact-layout">
          <div className="contact-panel">
            <p className="eyebrow">{category?.title[locale]}</p>
            <h2>{product.ctaLabel[locale]}</h2>
            <p>{product.summary[locale]}</p>
          </div>
          <LeadForm
            locale={locale}
            sourcePage={`/${locale}/products/${product.slug}`}
            productSlug={product.slug}
          />
        </div>
      </section>
    </>
  );
}
