import Link from 'next/link';
import { getFootnotes } from '@/lib/footnotes';
import SiteNav from '../components/SiteNav';

export const metadata = {
  title: 'Footnotes — Jack Lynch',
  description: 'Short thoughts on random topics.',
};

export default async function FootnotesPage() {
  const footnotes = await getFootnotes();

  return (
    <main className="public-page-shell">
      <SiteNav />

      <section className="page-hero">
        <h1>Footnotes</h1>
        <p>Quick thoughts on random topics. Less polished, more exploratory.</p>
      </section>

      {footnotes.length === 0 && (
        <section className="empty-state">
          <h2>Nothing here yet.</h2>
          <p>Footnotes will appear here once published.</p>
        </section>
      )}

      {footnotes.length > 0 && (
        <ul className="essay-list">
          {footnotes.map((fn) => (
            <li key={fn.slug}>
              <Link href={`/footnotes/${fn.slug}`}>{fn.title}</Link>
              <span className="essay-date">{fn.date}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
