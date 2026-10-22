import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
export default async function Admin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Anton Fix · Admin</h1>
        <form
          action={async () => {
            "use server";
            if (!(await auth())?.user) redirect("/login");
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button>Sign out</button>
        </form>
      </header>
      <p className="mt-8">
        Signed in as {session.user.name}. Job management will be added in M4.
      </p>
    </main>
  );
}
