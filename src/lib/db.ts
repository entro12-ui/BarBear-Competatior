import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __barbearPool: Pool | undefined;
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL in environment");
  }
  return url;
}

function needsSsl(connectionString: string): boolean {
  try {
    const host = new URL(connectionString).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return true;
  }
}

export function getPool(): Pool {
  if (!global.__barbearPool) {
    const connectionString = getDatabaseUrl();
    global.__barbearPool = new Pool({
      connectionString,
      ssl: needsSsl(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return global.__barbearPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return getPool().query<T>(text, params);
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] ?? null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
