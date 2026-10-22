import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { users } from "./schema";
export async function findOwner(
  email: string,
): Promise<typeof users.$inferSelect | undefined> {
  return (
    await getDb().select().from(users).where(eq(users.email, email)).limit(1)
  )[0];
}
