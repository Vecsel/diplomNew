import { type QueryResult, Pool } from "pg";
import { env } from "./env.js";

export const pool = new Pool({
  connectionString: env.databaseUrl
});

export async function connectDb() {
  await pool.query("SELECT 1");
}

export async function query<T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
  return pool.query(text, params);
}
