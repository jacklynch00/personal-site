import { Pool, QueryResultRow } from 'pg';

let pool: Pool | null = null;

function normalizeConnectionString(connectionString: string) {
  if (connectionString.includes('sslmode=disable')) return connectionString;

  const url = new URL(connectionString);
  const sslMode = url.searchParams.get('sslmode');
  if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
    url.searchParams.set('sslmode', 'verify-full');
  }
  return url.toString();
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!pool) {
    const connectionString = normalizeConnectionString(process.env.DATABASE_URL);
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=disable')
        ? false
        : { rejectUnauthorized: false },
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await getPool().query<T>(text, params);
  return result;
}
