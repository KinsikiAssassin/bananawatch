# 🍌 BananaWatch — AI Produce Freshness Analyzer

A mobile-first PWA that uses GPT-4o Vision to analyze banana ripeness from photos. Snap, analyze, track.

**Live Demo**: [bananawatch.vercel.app](https://bananawatch.vercel.app) _(coming soon)_

---

## Features

- **Instant Scan** — Take a photo or upload an image, get ripeness score in seconds
- **Smart Analysis** — AI detects color, spots, and texture to estimate ripeness (0-100%), days until spoilage, and eating recommendations
- **Recipe Suggestions** — Overripe banana? Get banana bread, smoothie, or pancake recipes
- **Banana Tracking** — Monitor the same banana over multiple days with a ripeness timeline chart
- **PWA** — Install on your phone's home screen, works like a native app

---

## Architecture

```
┌──────────────────────────────────────────┐
│     Mobile Frontend (Next.js 14 PWA)     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Camera   │ │ History  │ │  Track   │ │
│  │  Scan     │ │  List    │ │ Timeline │ │
│  └────┬──────┘ └──────────┘ └──────────┘ │
│       │ Server Actions                    │
├───────┼───────────────────────────────────┤
│       ▼                                   │
│     Backend (Next.js API + Prisma)        │
│  ┌──────────┐ ┌──────────────────────┐   │
│  │ NextAuth │ │ Image → GPT-4o Vision│   │
│  └──────────┘ └──────────────────────┘   │
└──────────┬────────────────────────────────┘
           ▼
   ┌──────────────┐
   │  PostgreSQL   │
   │  (Neon)       │
   └──────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + PWA |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js (Google OAuth) |
| AI | OpenAI GPT-4o Vision API |
| Camera | MediaDevices API |
| Images | browser-image-compression |
| Charts | Recharts |
| Deployment | Vercel |

---

## Getting Started

```bash
git clone https://github.com/yourusername/bananawatch.git
cd bananawatch
npm install
cp .env.example .env.local
# Fill in your credentials
npx prisma db push
npm run dev
```

Open on your phone (same WiFi): `http://your-local-ip:3000`

---

## Why This Exists

I eat a banana after every workout. I kept buying bananas that were either too green or already brown. So I built a tool that tells me exactly when to eat them.

---

Built by [Yanzi Liang](https://github.com/KinsikiAssassin)
