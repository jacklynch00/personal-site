import { NextRequest, NextResponse } from 'next/server';

const PUBLISH_PASSWORD = process.env.PUBLISH_PASSWORD || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'jacklynch00/personal-site';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export async function POST(req: NextRequest) {
  const { password, title, date, content, slug } = await req.json();

  if (!password || password !== PUBLISH_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  if (!title || !content || !slug) {
    return NextResponse.json({ error: 'Missing title, content, or slug' }, { status: 400 });
  }

  const mdxContent = `---\ntitle: "${title}"\ndate: "${date}"\n---\n\n${content}\n`;
  const filePath = `content/essays/${slug}.mdx`;
  const encoded = Buffer.from(mdxContent).toString('base64');

  try {
    // Check if file already exists (to get its SHA for updates)
    let sha: string | undefined;
    const checkRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }

    // Create or update the file
    const body: Record<string, string> = {
      message: `Publish essay: ${title}`,
      content: encoded,
      branch: GITHUB_BRANCH,
    };
    if (sha) body.sha = sha;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: `/essays/${slug}` });
  } catch (e) {
    return NextResponse.json({ error: `Failed to publish: ${e}` }, { status: 500 });
  }
}
