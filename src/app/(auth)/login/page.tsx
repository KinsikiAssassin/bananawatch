import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "@/components/auth/SignInButton";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/scan");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-amber-50 px-4 py-12">
      <div />

      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-8xl drop-shadow-sm">🍌</span>
          <h1 className="text-3xl font-bold text-amber-900">BananaWatch</h1>
          <p className="text-base text-amber-700">
            Point. Snap. Know exactly when to eat it.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["AI Ripeness Score", "Daily Tracking", "Recipe Ideas"].map((f) => (
            <span
              key={f}
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
            >
              {f}
            </span>
          ))}
        </div>

        <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
          <p className="mb-4 text-sm font-medium text-gray-500">
            Sign in to get started — it&apos;s free
          </p>
          <SignInButton />
        </div>
      </div>

      <p className="text-center text-xs text-amber-400">
        No banana was harmed in the making of this app 🍌
      </p>
    </main>
  );
}
