import { NextRequest, NextResponse } from 'next/server';
import { getAllEssays } from '@/lib/essays';
import { getAllFootnotes } from '@/lib/footnotes';

const PUBLISH_PASSWORD = process.env.PUBLISH_PASSWORD || '';

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get('password');

  if (!password || password !== PUBLISH_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const allEssays = await getAllEssays();
  const allFootnotes = await getAllFootnotes();

  return NextResponse.json({
    essays: allEssays.filter((e) => e.draft),
    footnotes: allFootnotes.filter((f) => f.draft),
  });
}
