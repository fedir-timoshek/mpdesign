import Link from "next/link";

export default function IndexPage() {
  return (
    <main className="locale-entry">
      <div className="locale-entry-card">
        <h1>MPDESIGN</h1>
        <p>Select your language / Sprache waehlen</p>
        <div className="locale-entry-actions">
          <Link href="/fr" className="btn btn-primary">
            Francais
          </Link>
          <Link href="/de" className="btn btn-ghost">
            Deutsch
          </Link>
        </div>
      </div>
    </main>
  );
}
