import { NextRequest, NextResponse } from 'next/server';

const PUBLISH_PASSWORD = process.env.PUBLISH_PASSWORD || '';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== PUBLISH_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
