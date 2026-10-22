import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
export function connectDatabase(url = process.env.DATABASE_URL) {
  if (!url) throw new Error("DATABASE_URL is required");
  const client = postgres(url, { max: 5 });
  return { db: drizzle(client, { schema }), client };
}
let connection: ReturnType<typeof connectDatabase> | undefined;
export function getDb() {
  return (connection ??= connectDatabase()).db;
}
