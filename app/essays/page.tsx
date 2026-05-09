import Link from 'next/link';
import { Metadata } from 'next';
import { getEssays } from '@/lib/essays';
import SiteNav from '../components/SiteNav';

export const metadata: Metadata = {
  title: 'Essays — Jack Lynch',
  description: 'Essays by Jack Lynch.',
};

export default async function EssaysPage() {
  const essays = await getEssays();

  return (
    <main className="public-page-shell">
      <SiteNav />

      <section className="page-hero">
        <h1>Essays</h1>
        <p>Notes on building, taste, momentum, and whatever I can&apos;t stop thinking about.</p>
      </section>

      {essays.length > 0 ? (
        <section className="essay-card-grid">
          {essays.map((essay) => (
            <Link key={essay.slug} href={`/essays/${essay.slug}`} className="essay-card">
              <div className="essay-card-top">
                <span className="essay-type">Essay</span>
                <span className="essay-date">{essay.date}</span>
              </div>
              <h2>{essay.title}</h2>
              <p>Read the essay</p>
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>No essays yet.</h2>
          <p>Drafts will appear here once published.</p>
        </section>
      )}
    </main>
  );
}
