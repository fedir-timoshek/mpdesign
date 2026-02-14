"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchLocalePath } from "@/lib/routing";
import { Locale } from "@/types/content";

type Props = {
  locale: Locale;
};

const labels: Record<Locale, string> = {
  fr: "FR",
  de: "DE",
};

export function LanguageSwitcher({ locale }: Props) {
  const pathname = usePathname() || `/${locale}`;

  return (
    <div className="language-switcher" aria-label="Language switcher">
      {(["fr", "de"] as Locale[]).map((target) => (
        <Link
          key={target}
          href={switchLocalePath(pathname, target)}
          className={`language-pill${target === locale ? " is-active" : ""}`}
          prefetch
        >
          {labels[target]}
        </Link>
      ))}
    </div>
  );
}
