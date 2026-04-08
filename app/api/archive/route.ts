import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';

const PUBLISH_PASSWORD = process.env.PUBLISH_PASSWORD || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'jacklynch00/personal-site';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export async function POST(req: NextRequest) {
  const { password, slug, type, archived } = await req.json();

  if (!password || password !== PUBLISH_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  if (!slug || !type || !['essay', 'footnote'].includes(type)) {
    return NextResponse.json({ error: 'Missing slug or invalid type' }, { status: 400 });
  }

  const folder = type === 'essay' ? 'essays' : 'footnotes';
  const filePath = `content/${folder}/${slug}.mdx`;

  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    if (!checkRes.ok) {
      return NextResponse.json({ error: 'File not found on GitHub' }, { status: 404 });
    }

    const existing = await checkRes.json();
    const fileContent = Buffer.from(existing.content, 'base64').toString('utf8');

    const { data, content } = matter(fileContent);

    if (archived) {
      data.archived = true;
    } else {
      delete data.archived;
    }

    const updated = matter.stringify(content, data);
    const encoded = Buffer.from(updated).toString('base64');

    const action = archived ? 'Archive' : 'Unarchive';
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `${action} ${type}: ${data.title}`,
          content: encoded,
          sha: existing.sha,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: `/${folder}/${slug}` });
  } catch (e) {
    return NextResponse.json({ error: `Failed to ${archived ? 'archive' : 'unarchive'}: ${e}` }, { status: 500 });
  }
}
