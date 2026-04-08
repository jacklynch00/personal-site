import { NextRequest, NextResponse } from 'next/server';

const PUBLISH_PASSWORD = process.env.PUBLISH_PASSWORD || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'jacklynch00/personal-site';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const FILE_PATH = 'content/books.json';

async function fetchBooksFromGitHub(): Promise<{ content: { goal: number; books: Array<Record<string, unknown>> }; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
  );

  if (!res.ok) {
    // File doesn't exist yet — return defaults with no SHA
    return { content: { goal: 12, books: [] }, sha: '' };
  }

  const data = await res.json();
  const decoded = Buffer.from(data.content, 'base64').toString('utf8');
  return { content: JSON.parse(decoded), sha: data.sha };
}

async function writeBooksToGitHub(content: Record<string, unknown>, sha: string): Promise<Response> {
  const encoded = Buffer.from(JSON.stringify(content, null, 2) + '\n').toString('base64');

  const body: Record<string, string> = {
    message: 'Update books',
    content: encoded,
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  return fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
}

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get('password');

  if (!password || password !== PUBLISH_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  try {
    const { content } = await fetchBooksFromGitHub();
    return NextResponse.json(content);
  } catch (e) {
    return NextResponse.json({ error: `Failed to fetch books: ${e}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { password, action, book, index } = await req.json();

  if (!password || password !== PUBLISH_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  try {
    const { content, sha } = await fetchBooksFromGitHub();
    const books = content.books as Array<Record<string, unknown>>;

    switch (action) {
      case 'add':
        if (!book) return NextResponse.json({ error: 'Missing book' }, { status: 400 });
        books.push(book);
        break;
      case 'update':
        if (index === undefined || !book) return NextResponse.json({ error: 'Missing index or book' }, { status: 400 });
        if (index < 0 || index >= books.length) return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
        books[index] = book;
        break;
      case 'delete':
        if (index === undefined) return NextResponse.json({ error: 'Missing index' }, { status: 400 });
        if (index < 0 || index >= books.length) return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
        books.splice(index, 1);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    content.books = books;
    const res = await writeBooksToGitHub(content, sha);

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `GitHub API error: ${err}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: `Failed to update books: ${e}` }, { status: 500 });
  }
}
