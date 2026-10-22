"use client";
import { useActionState } from "react";
import { login } from "./actions";
export function LoginForm() {
  const [error, action, pending] = useActionState(login, "");
  return (
    <form action={action} className="space-y-5">
      <label className="block">
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label className="block">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <p role="alert">{error}</p>
      <button disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
