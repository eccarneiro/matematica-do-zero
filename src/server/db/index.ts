import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function connect() {
  const url = process.env.DATABASE_URL;
  return url ? drizzle(neon(url), { schema }) : null;
}

/** Conexão com o Postgres (Neon). null quando DATABASE_URL não está configurada. */
export const db = connect();
export { schema };
