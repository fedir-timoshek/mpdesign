import Link from "next/link";
import { localizedFooter } from "@/lib/site-config";
import { Locale } from "@/types/content";

type Props = {
  locale: Locale;
};

export function SiteFooter({ locale }: Props) {
  const labels = localizedFooter[locale];

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">MPDESIGN</p>
          <p className="footer-copy">{labels.partner}</p>
        </div>

        <nav className="footer-links" aria-label="Legal links">
          <Link href={`/${locale}/impressum`}>{labels.legal}</Link>
          <Link href={`/${locale}/datenschutz`}>{labels.privacy}</Link>
          <Link href={`/${locale}/cookies`}>{labels.cookies}</Link>
        </nav>

        <p className="footer-copy">
          © {new Date().getFullYear()} MPDESIGN. {labels.rights}
        </p>
      </div>
    </footer>
  );
}
