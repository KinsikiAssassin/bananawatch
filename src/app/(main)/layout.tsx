import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-amber-50">
      <Header />
      {/* top padding for fixed header (~57px) + bottom padding for fixed nav (~72px) */}
      <main className="flex-1 pt-[57px] pb-[72px]">
        <div className="mx-auto max-w-md">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
