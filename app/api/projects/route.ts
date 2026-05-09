import { NextRequest, NextResponse } from 'next/server';
import {
  createProject,
  deleteProject,
  getProjects,
  ProjectInput,
  refreshProjectRevenue,
  updateProject,
} from '@/lib/projects';

const PUBLISH_PASSWORD = process.env.PUBLISH_PASSWORD || '';

function isAuthenticated(password: unknown) {
  return typeof password === 'string' && password.length > 0 && password === PUBLISH_PASSWORD;
}

function normalizeTags(tags: unknown) {
  if (Array.isArray(tags)) {
    return tags.map(String).map((tag) => tag.trim()).filter(Boolean);
  }
  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function normalizeProject(body: Record<string, unknown>): ProjectInput {
  return {
    title: String(body.title || ''),
    slug: String(body.slug || ''),
    url: body.url ? String(body.url) : null,
    shortStory: String(body.shortStory || ''),
    status: String(body.status || 'building') as ProjectInput['status'],
    tags: normalizeTags(body.tags),
    isPrivate: Boolean(body.isPrivate),
    featured: Boolean(body.featured),
    displayOrder: Number(body.displayOrder || 0),
    startedAt: body.startedAt ? String(body.startedAt) : null,
    endedAt: body.endedAt ? String(body.endedAt) : null,
    stripeEnvVar: body.stripeEnvVar ? String(body.stripeEnvVar) : null,
    stripeSecretKey:
      typeof body.stripeSecretKey === 'string'
        ? body.stripeSecretKey
        : undefined,
  };
}

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get('password');
  const includePrivate = isAuthenticated(password);

  try {
    const projects = await getProjects({ includePrivate });
    return NextResponse.json({ projects });
  } catch (e) {
    return NextResponse.json({ error: `Failed to fetch projects: ${e}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password, action, id } = body;

  if (!isAuthenticated(password)) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  try {
    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
      await deleteProject(String(id));
      return NextResponse.json({ success: true });
    }

    if (action === 'refresh-revenue') {
      if (!id) return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
      await refreshProjectRevenue(String(id));
      const projects = await getProjects({ includePrivate: true });
      return NextResponse.json({ success: true, projects });
    }

    const project = normalizeProject(body);
    if (action === 'create') {
      const created = await createProject(project);
      return NextResponse.json({ project: created });
    }
    if (action === 'update') {
      if (!id) return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
      const updated = await updateProject(String(id), project);
      return NextResponse.json({ project: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
