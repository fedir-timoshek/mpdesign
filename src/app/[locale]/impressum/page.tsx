import { Metadata } from "next";
import { LeadSection } from "@/components/lead-section";
import { resolveLegalPage } from "@/components/legal-page";
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
  const { seo } = await resolveLegalPage({ locale: safeLocale, slug: "impressum" });
  const social = buildSocialMetadata(safeLocale, seo.title, seo.description);
  return {
    title: seo.title,
    description: seo.description,
    alternates: buildLocaleAlternates(
      safeLocale,
      (itemLocale) => `/${itemLocale}/impressum`,
    ),
    ...social,
  };
}

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params;
  const safeLocale = resolveLocale(locale);
  const { page } = await resolveLegalPage({ locale: safeLocale, slug: "impressum" });

  return (
    <>
      <section className="section legal-shell">
        <div className="container legal-content">
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          {page.sections.map((section) => (
            <article key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <LeadSection locale={safeLocale} sourcePage={`/${safeLocale}/impressum`} />
    </>
  );
}
