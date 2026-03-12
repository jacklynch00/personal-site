import { getEssay, getEssays } from '@/lib/essays';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Params = { slug: string };

export async function generateStaticParams() {
  const essays = await getEssays();
  return essays.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) return {};
  return {
    title: `${essay.title} — Jack Lynch`,
    description: essay.title,
  };
}

export default async function EssayPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) notFound();

  return (
    <article>
      <Link href="/" className="back-link">← Jack Lynch</Link>
      <h1>{essay.title}</h1>
      <p className="essay-date" style={{ marginLeft: 0 }}>{essay.date}</p>
      <div className="prose">
        <MDXRemote source={essay.content} />
      </div>
    </article>
  );
}
