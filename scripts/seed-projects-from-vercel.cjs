#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleize(value) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeConnectionString(connectionString) {
  if (connectionString.includes('sslmode=disable')) return connectionString;

  const url = new URL(connectionString);
  const sslMode = url.searchParams.get('sslmode');
  if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
    url.searchParams.set('sslmode', 'verify-full');
  }
  return url.toString();
}

async function ensureTables(pool) {
  await pool.query(`
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
  await pool.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS stripe_secret_encrypted text');
}

function getProductionUrl(project) {
  const targets = [
    project.latestDeployments?.find((deployment) => deployment.target === 'production')?.url,
    project.targets?.production?.alias?.[0],
    project.alias?.[0],
  ].filter(Boolean);

  const value = targets[0];
  if (!value) return null;
  return value.startsWith('http') ? value : `https://${value}`;
}

async function fetchVercelProjects() {
  const params = new URLSearchParams({ limit: '100' });
  if (process.env.VERCEL_TEAM_ID) params.set('teamId', process.env.VERCEL_TEAM_ID);

  const res = await fetch(`https://api.vercel.com/v10/projects?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Vercel API failed ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return Array.isArray(data.projects) ? data.projects : data;
}

async function main() {
  loadEnvFile();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (!process.env.VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN is required');
  }

  const pool = new Pool({
    connectionString: normalizeConnectionString(process.env.DATABASE_URL),
    ssl: process.env.DATABASE_URL.includes('sslmode=disable')
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    await ensureTables(pool);
    const projects = await fetchVercelProjects();
    let inserted = 0;
    let skipped = 0;

    for (const project of projects) {
      const slug = slugify(project.name || project.id);
      const title = titleize(project.name || slug);
      const tags = [project.framework, project.link?.type].filter(Boolean);
      const url = getProductionUrl(project);
      const createdAt = project.createdAt
        ? new Date(project.createdAt).toISOString().split('T')[0]
        : null;

      const result = await pool.query(
        `
          INSERT INTO projects (
            title, slug, url, short_story, status, tags, is_private, featured,
            display_order, started_at
          )
          VALUES ($1, $2, $3, $4, 'live', $5, false, false, 0, $6)
          ON CONFLICT (slug) DO NOTHING
          RETURNING id
        `,
        [
          title,
          slug,
          url,
          'Imported from Vercel. Add the story, tags, and Stripe key in admin.',
          tags,
          createdAt,
        ]
      );

      if (result.rowCount) {
        inserted += 1;
        console.log(`Inserted ${title}`);
      } else {
        skipped += 1;
        console.log(`Skipped ${title} (already exists)`);
      }
    }

    console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
