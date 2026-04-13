import Link from "next/link";

const features = [
  {
    icon: "📷",
    title: "Instant Scan",
    desc: "Point your camera at any banana and get an AI ripeness score in seconds.",
  },
  {
    icon: "📈",
    title: "Track Over Time",
    desc: "Scan the same banana daily and watch its ripeness chart evolve.",
  },
  {
    icon: "🍞",
    title: "Recipe Ideas",
    desc: "When it's overripe, get personalized banana bread and smoothie recipes.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-amber-50">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍌</span>
          <span className="text-lg font-bold text-amber-900">BananaWatch</span>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-300 active:scale-95"
        >
          Sign in
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center gap-8 px-6 py-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700">
            Powered by GPT-4o Vision
          </span>
          <h1 className="max-w-xs text-4xl font-extrabold leading-tight text-amber-900 sm:max-w-md sm:text-5xl">
            How ripe is your banana?
          </h1>
          <p className="max-w-xs text-base text-amber-700 sm:max-w-sm">
            Snap a photo, get an instant ripeness score, and never eat a bad banana again.
          </p>
        </div>

        {/* Phone mockup */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 -m-6 rounded-full bg-amber-300/30 blur-2xl" />
          <div className="relative w-52 overflow-hidden rounded-[2.8rem] border-[6px] border-gray-800 bg-gray-900 shadow-2xl">
            {/* Notch */}
            <div className="absolute left-1/2 top-0 z-10 h-5 w-20 -translate-x-1/2 rounded-b-2xl bg-gray-800" />
            {/* Screen */}
            <div className="flex flex-col bg-amber-50">
              {/* Header */}
              <div className="flex items-center justify-between bg-white px-4 pb-2 pt-6">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🍌</span>
                  <span className="text-[11px] font-bold text-amber-900">BananaWatch</span>
                </div>
                <div className="h-5 w-5 rounded-full bg-amber-200" />
              </div>
              {/* Viewfinder */}
              <div className="relative flex aspect-[4/3] items-center justify-center bg-gray-900">
                <span className="text-5xl drop-shadow-lg">🍌</span>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-20 rounded-2xl border-2 border-dashed border-white/40" />
                </div>
              </div>
              {/* Result card */}
              <div className="flex items-center justify-between bg-white px-4 py-2.5 shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-amber-700">✨ Perfect</p>
                  <p className="text-[9px] text-gray-400">Eat today!</p>
                </div>
                <span className="text-xl font-extrabold text-amber-500">72%</span>
              </div>
              {/* Bottom nav */}
              <div className="flex justify-around bg-white px-2 py-2.5">
                {["📋", "📷", "📊"].map((icon, i) => (
                  <div key={i} className={`flex flex-col items-center gap-0.5 ${i === 1 ? "rounded-xl bg-amber-400 px-3 py-1" : ""}`}>
                    <span className="text-sm">{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-2xl bg-amber-400 px-8 py-4 text-base font-bold text-amber-900 shadow-lg transition hover:bg-amber-300 active:scale-95"
        >
          Get Started — it&apos;s free
          <span>→</span>
        </Link>
        <p className="text-xs text-amber-400">No credit card required · Works on any phone</p>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-10">
        <h2 className="mb-6 text-center text-xl font-bold text-amber-900">
          Everything you need to never waste a banana
        </h2>
        <div className="mx-auto flex max-w-md flex-col gap-4">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <span className="mt-0.5 text-3xl">{f.icon}</span>
              <div>
                <p className="font-bold text-amber-900">{f.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-12 text-center">
        <div className="mx-auto max-w-sm rounded-3xl bg-amber-400 p-8 shadow-lg">
          <p className="text-3xl">🍌</p>
          <h3 className="mt-3 text-xl font-extrabold text-amber-900">
            Ready to scan your first banana?
          </h3>
          <p className="mt-2 text-sm text-amber-800">
            Join the freshness revolution. It takes 10 seconds.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-900 px-7 py-3.5 font-bold text-amber-50 shadow-md transition hover:bg-amber-800 active:scale-95"
          >
            Start Scanning
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center text-xs text-amber-400">
        <p>🍌 BananaWatch · Built with Next.js &amp; GPT-4o Vision</p>
        <p className="mt-1">No bananas were harmed in the making of this app</p>
      </footer>
    </main>
  );
}
