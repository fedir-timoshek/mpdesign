"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackCtaEvent } from "@/lib/analytics";
import { Locale } from "@/types/content";

type Props = {
  locale: Locale;
};

export function CtaTracker({ locale }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const el = target.closest<HTMLElement>("[data-mpdesign-cta='1']");
      if (!el) {
        return;
      }

      const channel = el.dataset.mpdesignCtaChannel;
      const placement = el.dataset.mpdesignCtaPlacement;

      if (!channel || !placement) {
        return;
      }

      const currentPath = window.location.pathname || pathname || "";
      const match = currentPath.match(new RegExp(`^/${locale}/products/([^/]+)`, "i"));
      const productSlug = match?.[1];

      trackCtaEvent({
        channel: channel as "whatsapp" | "call" | "form",
        placement: placement as "header_quote" | "header_contact" | "product_hero",
        locale,
        sourcePage: currentPath || undefined,
        productSlug: productSlug || undefined,
      });
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [locale, pathname]);

  return null;
}

