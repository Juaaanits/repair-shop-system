import "dotenv/config";
import { hash } from "bcryptjs";
import { z } from "zod";
import { connectDatabase } from "../src/server/db";
import { users, settings } from "../src/server/db/schema";
const env = z
  .object({
    OWNER_EMAIL: z.email().transform((v) => v.toLowerCase()),
    OWNER_PASSWORD: z
      .string()
      .min(12)
      .refine(
        (v) => Buffer.byteLength(v, "utf8") <= 72,
        "Password exceeds bcrypt's 72-byte limit",
      ),
    OWNER_NAME: z.string().min(1).default("Anton"),
  })
  .parse(process.env);
const { db, client } = connectDatabase();
try {
  const passwordHash = await hash(env.OWNER_PASSWORD, 12);
  await db.transaction(async (tx) => {
    // Reruns preserve the existing account and settings; seeding is not a password reset.
    await tx
      .insert(users)
      .values({ name: env.OWNER_NAME, email: env.OWNER_EMAIL, passwordHash })
      .onConflictDoNothing({ target: users.email });
    await tx
      .insert(settings)
      .values({
        id: 1,
        shopName: "Anton Fix Appliances Repair",
        tagline: "Appliance repair service",
        ownerName: env.OWNER_NAME,
        address: "",
        phone: "",
        defaultWarrantyDays: 30,
        unclaimedDays: 90,
        termsText:
          "Repair estimates require customer approval before work begins. Existing damage and unrelated faults are excluded from the repair. Bring this slip and a valid ID when claiming. Contact the shop about items unclaimed for 90 days. Personal data is used to manage repairs and contact you.",
        warrantyText:
          "Warranty covers only the repaired fault and replaced parts for the warranty period recorded on the job. Misuse, liquid damage, power surges, tampering, and unrelated faults are excluded.",
        notificationText:
          "We will contact you using your provided phone or Messenger details when your appliance is ready. Please keep your contact details current.",
      })
      .onConflictDoNothing();
  });
  console.info("Owner and default settings seeded (existing rows preserved).");
} finally {
  await client.end();
}
