import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Prevent Next.js from statically analysing this route at build time.
// NextAuth + PrismaAdapter requires a live DB connection at runtime only.
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
