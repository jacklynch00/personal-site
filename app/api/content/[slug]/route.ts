import { NextRequest, NextResponse } from 'next/server';
import { getEssay } from '@/lib/essays';
import { getFootnote } from '@/lib/footnotes';

const PUBLISH_PASSWORD = process.env.PUBLISH_PASSWORD || '';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const password = req.nextUrl.searchParams.get('password');

  if (!password || password !== PUBLISH_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get('type');
  const { slug } = await params;

  if (type === 'footnote') {
    const footnote = await getFootnote(slug);
    if (!footnote) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(footnote);
  }

  const essay = await getEssay(slug);
  if (!essay) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(essay);
}
