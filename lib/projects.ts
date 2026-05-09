import Stripe from 'stripe';
import { hasDatabase, query } from './db';
import { PROJECT_STATUSES, Project, ProjectStatus, RevenueMonth } from './projectTypes';
import { decryptSecret, encryptSecret } from './secretCrypto';
export { PROJECT_STATUSES, formatStatus, projectRevenueTotal } from './projectTypes';

export interface ProjectInput {
  title: string;
  slug: string;
  url?: string | null;
  shortStory: string;
  status: ProjectStatus;
  tags: string[];
  isPrivate: boolean;
  featured: boolean;
  displayOrder: number;
  startedAt?: string | null;
  endedAt?: string | null;
  stripeEnvVar?: string | null;
  stripeSecretKey?: string | null;
}

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  url: string | null;
  short_story: string;
  status: ProjectStatus;
  tags: string[] | null;
  is_private: boolean;
  featured: boolean;
  display_order: number;
  started_at: Date | string | null;
  ended_at: Date | string | null;
  stripe_env_var: string | null;
  stripe_secret_encrypted: string | null;
  revenue_months: RevenueMonth[] | null;
  revenue_updated_at: Date | string | null;
};

function toIsoDate(value: Date | string | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return value;
}

function toIso(value: Date | string | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    url: row.url,
    shortStory: row.short_story,
    status: row.status,
    tags: row.tags || [],
    isPrivate: row.is_private,
    featured: row.featured,
    displayOrder: row.display_order,
    startedAt: toIsoDate(row.started_at),
    endedAt: toIsoDate(row.ended_at),
    stripeEnvVar: row.stripe_env_var,
    stripeSecretConfigured: Boolean(row.stripe_secret_encrypted),
    revenueMonths: row.revenue_months || [],
    revenueUpdatedAt: toIso(row.revenue_updated_at),
  };
}

export async function ensureProjectTables() {
  if (!hasDatabase()) return;

  await query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS projects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      slug text NOT NULL UNIQUE,
      url text,
      short_story text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'building',
      tags text[] NOT NULL DEFAULT '{}',
      is_private boolean NOT NULL DEFAULT false,
      featured boolean NOT NULL DEFAULT false,
      display_order integer NOT NULL DEFAULT 0,
      started_at date,
      ended_at date,
      stripe_env_var text,
      stripe_secret_encrypted text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT projects_status_check CHECK (status IN ('building', 'live', 'paused', 'retired'))
    );

    CREATE TABLE IF NOT EXISTS project_revenue_cache (
      project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      month date NOT NULL,
      amount_cents integer NOT NULL DEFAULT 0,
      currency text NOT NULL DEFAULT 'usd',
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (project_id, month)
    );
  `);

  await query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS stripe_secret_encrypted text');
  await query(`
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
    UPDATE projects
    SET status = CASE
      WHEN status IN ('shipping', 'tinkering') THEN 'building'
      WHEN status = 'launched' THEN 'live'
      WHEN status = 'shelved' THEN 'paused'
      WHEN status = 'scrapped' THEN 'retired'
      ELSE status
    END;
    ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'building';
    ALTER TABLE projects
      ADD CONSTRAINT projects_status_check
      CHECK (status IN ('building', 'live', 'paused', 'retired'));
  `);
}

export async function getProjects(options: { includePrivate?: boolean; limit?: number } = {}) {
  if (!hasDatabase()) return [];
  await ensureProjectTables();

  const where = options.includePrivate ? '' : 'WHERE p.is_private = false';
  const limit = options.limit ? 'LIMIT $1' : '';
  const params = options.limit ? [options.limit] : [];

  const result = await query<ProjectRow>(
    `
      SELECT
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'month', to_char(prc.month, 'YYYY-MM'),
              'amountCents', prc.amount_cents
            )
            ORDER BY prc.month
          ) FILTER (WHERE prc.project_id IS NOT NULL),
          '[]'
        ) AS revenue_months,
        MAX(prc.updated_at) AS revenue_updated_at
      FROM projects p
      LEFT JOIN project_revenue_cache prc ON prc.project_id = p.id
      ${where}
      GROUP BY p.id
      ORDER BY p.featured DESC, p.display_order ASC, p.started_at DESC NULLS LAST, p.created_at DESC
      ${limit}
    `,
    params
  );

  return result.rows.map(mapProject);
}

export async function getProjectBySlug(slug: string, includePrivate = false) {
  const projects = await getProjects({ includePrivate });
  return projects.find((project) => project.slug === slug) || null;
}

function validateProject(input: ProjectInput) {
  if (!input.title.trim()) throw new Error('Title is required');
  if (!input.slug.trim()) throw new Error('Slug is required');
  if (!PROJECT_STATUSES.includes(input.status)) throw new Error('Invalid project status');
}

export async function createProject(input: ProjectInput) {
  if (!hasDatabase()) throw new Error('DATABASE_URL is not configured');
  validateProject(input);
  await ensureProjectTables();

  const result = await query<ProjectRow>(
    `
      INSERT INTO projects (
        title, slug, url, short_story, status, tags, is_private, featured,
        display_order, started_at, ended_at, stripe_env_var, stripe_secret_encrypted
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *, '[]'::json AS revenue_months, NULL::timestamptz AS revenue_updated_at
    `,
    [
      input.title.trim(),
      input.slug.trim(),
      input.url || null,
      input.shortStory.trim(),
      input.status,
      input.tags,
      input.isPrivate,
      input.featured,
      input.displayOrder,
      input.startedAt || null,
      input.endedAt || null,
      input.stripeEnvVar || null,
      input.stripeSecretKey?.trim() ? encryptSecret(input.stripeSecretKey.trim()) : null,
    ]
  );

  return mapProject(result.rows[0]);
}

export async function updateProject(id: string, input: ProjectInput) {
  if (!hasDatabase()) throw new Error('DATABASE_URL is not configured');
  validateProject(input);
  await ensureProjectTables();

  const result = await query<ProjectRow>(
    `
      UPDATE projects
      SET
        title = $2,
        slug = $3,
        url = $4,
        short_story = $5,
        status = $6,
        tags = $7,
        is_private = $8,
        featured = $9,
        display_order = $10,
        started_at = $11,
        ended_at = $12,
        stripe_env_var = $13,
        stripe_secret_encrypted = CASE
          WHEN $14::text IS NULL THEN stripe_secret_encrypted
          WHEN $14::text = '' THEN NULL
          ELSE $14::text
        END,
        updated_at = now()
      WHERE id = $1
      RETURNING *, '[]'::json AS revenue_months, NULL::timestamptz AS revenue_updated_at
    `,
    [
      id,
      input.title.trim(),
      input.slug.trim(),
      input.url || null,
      input.shortStory.trim(),
      input.status,
      input.tags,
      input.isPrivate,
      input.featured,
      input.displayOrder,
      input.startedAt || null,
      input.endedAt || null,
      input.stripeEnvVar || null,
      input.stripeSecretKey === undefined || input.stripeSecretKey === null
        ? null
        : input.stripeSecretKey.trim()
          ? encryptSecret(input.stripeSecretKey.trim())
          : '',
    ]
  );

  if (!result.rows[0]) throw new Error('Project not found');
  return mapProject(result.rows[0]);
}

export async function deleteProject(id: string) {
  if (!hasDatabase()) throw new Error('DATABASE_URL is not configured');
  await ensureProjectTables();
  await query('DELETE FROM projects WHERE id = $1', [id]);
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function trailingMonths(count: number) {
  const now = startOfMonth(new Date());
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    date.setUTCMonth(now.getUTCMonth() - (count - 1 - index));
    return date;
  });
}

export async function refreshProjectRevenue(projectId: string) {
  if (!hasDatabase()) throw new Error('DATABASE_URL is not configured');
  await ensureProjectTables();

  const projectResult = await query<{
    id: string;
    stripe_env_var: string | null;
    stripe_secret_encrypted: string | null;
  }>(
    'SELECT id, stripe_env_var, stripe_secret_encrypted FROM projects WHERE id = $1',
    [projectId]
  );
  const project = projectResult.rows[0];
  if (!project) throw new Error('Project not found');

  const secretKey = project.stripe_secret_encrypted
    ? decryptSecret(project.stripe_secret_encrypted)
    : project.stripe_env_var
      ? process.env[project.stripe_env_var]
      : null;

  if (!secretKey) throw new Error('Project has no Stripe secret configured');

  const stripe = new Stripe(secretKey, {
    apiVersion: '2026-02-25.clover' as any,
  });

  const months = trailingMonths(12);
  const monthlyTotals = new Map(months.map((month) => [month.toISOString().slice(0, 7), 0]));
  const start = Math.floor(months[0].getTime() / 1000);

  for await (const tx of stripe.balanceTransactions.list({
    created: { gte: start },
    limit: 100,
  })) {
    if (tx.currency !== 'usd') continue;
    if (!['charge', 'refund', 'payment_refund'].includes(tx.type)) continue;

    const month = new Date(tx.created * 1000).toISOString().slice(0, 7);
    if (!monthlyTotals.has(month)) continue;
    monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + tx.amount);
  }

  for (const month of months) {
    const monthKey = month.toISOString().slice(0, 7);
    await query(
      `
        INSERT INTO project_revenue_cache (project_id, month, amount_cents, currency, updated_at)
        VALUES ($1, $2, $3, 'usd', now())
        ON CONFLICT (project_id, month)
        DO UPDATE SET amount_cents = EXCLUDED.amount_cents, updated_at = now()
      `,
      [projectId, `${monthKey}-01`, monthlyTotals.get(monthKey) || 0]
    );
  }
}
