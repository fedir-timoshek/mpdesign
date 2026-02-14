import Image from "next/image";
import Link from "next/link";
import { localizedNavigation } from "@/lib/site-config";
import { Locale } from "@/types/content";
import { LanguageSwitcher } from "@/components/language-switcher";

type Props = {
  locale: Locale;
  showShutters: boolean;
};

export function SiteHeader({ locale, showShutters }: Props) {
  const nav = localizedNavigation[locale];

  return (
    <header className="site-header">
      <div className="container header-shell">
        <Link href={`/${locale}`} className="brand-link" aria-label="MPDESIGN home">
          <Image
            src="/brand/logo.jpg"
            alt="MPDESIGN"
            width={180}
            height={103}
            className="brand-logo"
            priority
          />
          <span className="brand-meta">Witraz Partner</span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <Link href={`/${locale}`}>{nav.home}</Link>
          <Link href={`/${locale}/windows/pvc`}>{nav.pvc}</Link>
          <Link href={`/${locale}/windows/wood`}>{nav.wood}</Link>
          <Link href={`/${locale}/windows/aluminum`}>{nav.aluminum}</Link>
          {showShutters ? <Link href={`/${locale}/shutters`}>{nav.shutters}</Link> : null}
          <Link href={`/${locale}/doors`}>{nav.doors}</Link>
          <a href="#lead-form">{nav.contact}</a>
        </nav>

        <div className="header-actions">
          <a className="btn btn-ghost" href="#lead-form">
            {nav.quote}
          </a>
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
