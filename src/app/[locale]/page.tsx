import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { ProductCard } from "@/components/product-card";
import {
  getCategoryPath,
  getProductsByCategory,
  getSeoForPage,
  getSiteContent,
} from "@/lib/content";
import { isLocale } from "@/lib/routing";
import { buildLocaleAlternates, resolveLocale } from "@/lib/seo";
import {
  localizedCategoryInfo,
  localizedLandingBlocks,
  localizedNavigation,
} from "@/lib/site-config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = resolveLocale(locale);
  const seo = getSeoForPage(safeLocale);

  return {
    title: seo.title,
    description: seo.description,
    alternates: buildLocaleAlternates(safeLocale, (itemLocale) => `/${itemLocale}`),
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      locale: safeLocale === "fr" ? "fr_CH" : "de_CH",
    },
  };
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return null;
  }

  const content = await getSiteContent();
  const blocks = localizedLandingBlocks[locale];
  const nav = localizedNavigation[locale];
  const catLabels = localizedCategoryInfo[locale];

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">MPDESIGN x Witraz</p>
            <h1>{content.landing.hero.title[locale]}</h1>
            <p>{content.landing.hero.description[locale]}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#lead-form">
                {content.landing.hero.primaryCta[locale]}
              </a>
              <a className="btn btn-ghost" href="#catalog-grid">
                {content.landing.hero.secondaryCta[locale]}
              </a>
            </div>
            <div className="hero-contact-strip">
              <a href={content.contacts.phoneHref}>{content.contacts.phoneDisplay}</a>
              <a href={`mailto:${content.contacts.email}`}>{content.contacts.email}</a>
              <a href={content.contacts.whatsappHref} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
          <div className="hero-media">
            <img src="/assets/images/pwh-win/V82powertherm.png" alt="Window showcase" />
          </div>
        </div>
      </section>

      <section className="section section-muted" id="catalog-grid">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">{nav.catalog}</p>
            <h2>{blocks.trustTitle}</h2>
            <p>{blocks.trustSubtitle}</p>
          </div>

          <div className="category-grid">
            {content.categories.map((category) => (
              <article key={category.slug} className="category-card">
                <div className="category-media">
                  <img
                    src={category.heroImage.src}
                    alt={category.heroImage.alt[locale]}
                    loading="lazy"
                  />
                </div>
                <div className="category-content">
                  <p className="category-tag">{catLabels.headingPrefix}</p>
                  <h3>{category.title[locale]}</h3>
                  <p>{category.description[locale]}</p>
                  <Link
                    href={getCategoryPath(category.slug, locale)}
                    className="btn btn-ghost"
                  >
                    {nav.catalog}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container trust-grid">
          {blocks.trustItems.map((item) => (
            <article key={item.title} className="trust-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="container process-shell">
          <div className="section-head">
            <p className="eyebrow">Process</p>
            <h2>{blocks.processTitle}</h2>
          </div>
          <div className="process-grid">
            {blocks.processSteps.map((step) => (
              <article key={step.title} className="process-card">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container section-head">
          <p className="eyebrow">Featured</p>
          <h2>{nav.catalog}</h2>
        </div>
        <div className="container cards-grid cards-grid-compact">
          {getProductsByCategory(content.products, "windows-pvc")
            .slice(0, 4)
            .map((product) => (
              <ProductCard key={product.slug} product={product} locale={locale} />
            ))}
        </div>
      </section>

      <section className="section section-contact" id="lead-section">
        <div className="container contact-layout">
          <div className="contact-panel">
            <p className="eyebrow">{content.contacts.serviceArea[locale]}</p>
            <h2>{blocks.leadTitle}</h2>
            <p>{blocks.leadDescription}</p>
            <ul>
              <li>
                <a href={content.contacts.phoneHref}>{content.contacts.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${content.contacts.email}`}>{content.contacts.email}</a>
              </li>
              <li>
                <a href={content.contacts.whatsappHref} target="_blank" rel="noreferrer">
                  {content.contacts.whatsappDisplay}
                </a>
              </li>
            </ul>
          </div>

          <LeadForm locale={locale} sourcePage={`/${locale}`} />
        </div>
      </section>
    </>
  );
}
