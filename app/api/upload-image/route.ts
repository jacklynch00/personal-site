import { NextRequest, NextResponse } from 'next/server';

const PUBLISH_PASSWORD = process.env.PUBLISH_PASSWORD || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'jacklynch00/personal-site';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get('password') as string;
  const file = formData.get('file') as File | null;

  if (!password || password !== PUBLISH_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Sanitize filename and add timestamp prefix
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const timestamp = Date.now();
  const filename = `${timestamp}-${baseName}.${ext}`;
  const filePath = `public/images/${filename}`;

  // Read file as base64
  const buffer = await file.arrayBuffer();
  const encoded = Buffer.from(buffer).toString('base64');

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload image: ${filename}`,
          content: encoded,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: `/images/${filename}` });
  } catch (e) {
    return NextResponse.json({ error: `Failed to upload: ${e}` }, { status: 500 });
  }
}
