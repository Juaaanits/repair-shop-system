import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./form";
export default async function Login() {
  if ((await auth())?.user) redirect("/admin");
  return (
    <main className="mx-auto my-16 max-w-md rounded-lg bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold">Anton Fix</h1>
      <p className="mb-8">Owner sign in</p>
      <LoginForm />
    </main>
  );
}
