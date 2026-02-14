import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeoForPage, getSiteContent } from "@/lib/content";
import { isLocale } from "@/lib/routing";
import { buildLocaleAlternates, resolveLocale } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "de" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = resolveLocale(locale);
  const seo = getSeoForPage(safeLocale);
  return {
    title: seo.title,
    description: seo.description,
    alternates: buildLocaleAlternates(
      safeLocale,
      (itemLocale) => `/${itemLocale}/windows`,
    ),
  };
}

export default async function WindowsIndexPage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = await getSiteContent();
  const categories = content.categories.filter(
    (category) => category.group === "windows",
  );

  return (
    <section className="section">
      <div className="container section-head">
        <p className="eyebrow">Windows</p>
        <h1>{locale === "fr" ? "Toutes les fenetres" : "Alle Fenster"}</h1>
      </div>

      <div className="container category-grid">
        {categories.map((category) => {
          const href =
            category.slug === "windows-pvc"
              ? `/${locale}/windows/pvc`
              : category.slug === "windows-wood"
                ? `/${locale}/windows/wood`
                : `/${locale}/windows/aluminum`;

          return (
            <article key={category.slug} className="category-card">
              <div className="category-media">
                <img src={category.heroImage.src} alt={category.heroImage.alt[locale]} />
              </div>
              <div className="category-content">
                <h2>{category.title[locale]}</h2>
                <p>{category.description[locale]}</p>
                <Link href={href} className="btn btn-ghost">
                  {locale === "fr" ? "Voir la gamme" : "Zur Serie"}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
