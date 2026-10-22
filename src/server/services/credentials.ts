import { z } from "zod";
import { compare } from "bcryptjs";
import { findOwner } from "../db/users";
export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z
    .string()
    .min(1)
    .max(72)
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "Password is too long",
    ),
});
// Valid bcrypt hash used to keep unknown-user verification on the same slow path.
const dummyHash =
  "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
export async function verifyCredentials(input: unknown) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return null;
  const owner = await findOwner(parsed.data.email);
  const valid = await compare(
    parsed.data.password,
    owner?.passwordHash ?? dummyHash,
  );
  if (!owner || !valid) return null;
  return { id: owner.id, name: owner.name, email: owner.email };
}
