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
