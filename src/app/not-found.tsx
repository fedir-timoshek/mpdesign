import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <p className="eyebrow">404</p>
        <h1>Page introuvable / Seite nicht gefunden</h1>
        <p>La page demandee n&apos;existe pas ou a ete deplacee.</p>
        <div className="not-found-actions">
          <Link href="/fr" className="btn btn-primary">
            Retour FR
          </Link>
          <Link href="/de" className="btn btn-ghost">
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
