import { LeadForm } from "@/components/lead-form";
import { contactConfig, localizedLandingBlocks } from "@/lib/site-config";
import { Locale } from "@/types/content";

type Props = {
  locale: Locale;
  sourcePage: string;
  productSlug?: string | undefined;
  heading?: string | undefined;
  description?: string | undefined;
};

export function LeadSection({
  locale,
  sourcePage,
  productSlug,
  heading,
  description,
}: Props) {
  const blocks = localizedLandingBlocks[locale];

  return (
    <section className="section section-contact" id="lead-section">
      <div className="container contact-layout">
        <div className="contact-panel">
          <p className="eyebrow">{contactConfig.serviceArea[locale]}</p>
          <h2>{heading ?? blocks.leadTitle}</h2>
          <p>{description ?? blocks.leadDescription}</p>
          <ul>
            <li>
              <a href={contactConfig.phoneHref}>{contactConfig.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${contactConfig.email}`}>{contactConfig.email}</a>
            </li>
            <li>
              <a href={contactConfig.whatsappHref} target="_blank" rel="noreferrer">
                {contactConfig.whatsappDisplay}
              </a>
            </li>
          </ul>
        </div>

        <LeadForm
          locale={locale}
          sourcePage={sourcePage}
          productSlug={productSlug}
        />
      </div>
    </section>
  );
}

