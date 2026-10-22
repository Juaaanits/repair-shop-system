"use server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { credentialsSchema } from "@/server/services/credentials";
export async function login(_previous: string, form: FormData) {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return "Enter a valid email and password.";
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError)
      return "Unable to sign in. Check your email and password.";
    throw error;
  }
  return "";
}
