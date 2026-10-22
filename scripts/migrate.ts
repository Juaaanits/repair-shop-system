import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connectDatabase } from "../src/server/db";
const { db, client } = connectDatabase();
try {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.info("Migrations applied.");
} finally {
  await client.end();
}
