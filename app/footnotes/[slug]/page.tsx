import { getFootnote, getFootnotes } from '@/lib/footnotes';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Params = { slug: string };

export async function generateStaticParams() {
  const footnotes = await getFootnotes();
  return footnotes.map((fn) => ({ slug: fn.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const footnote = await getFootnote(slug);
  if (!footnote) return {};
  return {
    title: `${footnote.title} — Footnotes — Jack Lynch`,
    description: footnote.title,
  };
}

export default async function FootnotePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const footnote = await getFootnote(slug);
  if (!footnote) notFound();

  return (
    <article>
      <Link href="/footnotes" className="back-link">← Footnotes</Link>
      <h1>{footnote.title}</h1>
      <p className="essay-date" style={{ marginLeft: 0 }}>{footnote.date}</p>
      <div className="prose">
        <MDXRemote source={footnote.content} />
      </div>
    </article>
  );
}
