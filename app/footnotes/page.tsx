import Link from 'next/link';
import { getFootnotes } from '@/lib/footnotes';

export const metadata = {
  title: 'Footnotes — Jack Lynch',
  description: 'Short thoughts on random topics.',
};

export default async function FootnotesPage() {
  const footnotes = await getFootnotes();

  return (
    <div>
      <Link href="/" className="back-link" style={{ display: 'block', marginBottom: '1.5rem', textDecoration: 'none', color: '#999', fontSize: '0.9rem' }}>
        ← Jack Lynch
      </Link>
      <h1>Footnotes</h1>
      <p style={{ color: '#666' }}>
        Quick thoughts on random topics. Less polished, more exploratory.
      </p>

      {footnotes.length === 0 && (
        <p style={{ color: '#999', marginTop: '2rem' }}>Nothing here yet.</p>
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
    </div>
  );
}
