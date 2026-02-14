"use client";

import { trackCtaEvent } from "@/lib/analytics";
import { ContactConfig, Locale } from "@/types/content";

type Props = {
  locale: Locale;
  contact: ContactConfig;
};

const labels = {
  fr: {
    whatsapp: "WhatsApp",
    call: "Appeler",
    form: "Devis",
  },
  de: {
    whatsapp: "WhatsApp",
    call: "Anrufen",
    form: "Angebot",
  },
} as const;

export function MobileStickyCta({ locale, contact }: Props) {
  const text = labels[locale];

  return (
    <div className="mobile-sticky-cta" role="navigation" aria-label="Quick contact">
      <a
        href={contact.whatsappHref}
        target="_blank"
        rel="noreferrer"
        onClick={() =>
          trackCtaEvent({
            channel: "whatsapp",
            placement: "mobile_sticky",
            locale,
          })
        }
      >
        {text.whatsapp}
      </a>
      <a
        href={contact.phoneHref}
        onClick={() =>
          trackCtaEvent({
            channel: "call",
            placement: "mobile_sticky",
            locale,
          })
        }
      >
        {text.call}
      </a>
      <a
        href="#lead-form"
        onClick={() =>
          trackCtaEvent({
            channel: "form",
            placement: "mobile_sticky",
            locale,
          })
        }
      >
        {text.form}
      </a>
    </div>
  );
}
