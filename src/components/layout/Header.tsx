import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";

export async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-amber-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">🍌</span>
          <span className="text-lg font-bold tracking-tight text-amber-900">
            BananaWatch
          </span>
        </div>

        {session?.user && (
          <div className="flex items-center gap-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full ring-2 ring-amber-200"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-semibold text-amber-800">
                {session.user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
