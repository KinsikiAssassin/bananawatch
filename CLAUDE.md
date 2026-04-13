# BananaWatch — AI Produce Freshness Analyzer

## Project Overview

A mobile-first PWA that uses GPT-4o Vision API to analyze banana ripeness from photos. Users snap a photo or upload an image, get an instant ripeness score, estimated days until spoilage, and eating/recipe suggestions based on the current stage.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Google OAuth)
- **AI**: OpenAI GPT-4o Vision API
- **Image Handling**: Browser MediaDevices API (camera), client-side compression with browser-image-compression
- **Charts**: Recharts (ripeness tracking over time)
- **PWA**: next-pwa (installable on mobile home screen)
- **Deployment**: Vercel

## Project Structure

```
bananawatch/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── icons/                 # PWA icons (192x192, 512x512)
│   └── sw.js                  # Service worker
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (main)/
│   │   │   ├── scan/page.tsx          # Camera / upload page
│   │   │   ├── result/[id]/page.tsx   # Analysis result page
│   │   │   ├── history/page.tsx       # Past scans list
│   │   │   └── track/[id]/page.tsx    # Banana tracking timeline
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                   # Landing page
│   ├── components/
│   │   ├── ui/                # Button, Card, Modal, etc.
│   │   ├── scan/              # Camera, ImageUpload, AnalysisResult
│   │   ├── history/           # ScanCard, ScanList
│   │   ├── track/             # RipenessChart, Timeline
│   │   └── layout/            # MobileNav, Header
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── openai.ts
│   │   ├── image-utils.ts     # Compression, base64 conversion
│   │   └── utils.ts           # cn() helper
│   ├── actions/
│   │   ├── analyze.ts         # Send image to GPT-4o Vision
│   │   └── scan.ts            # CRUD for scan history
│   ├── hooks/
│   │   └── use-camera.ts      # Custom hook for camera access
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── index.ts           # Ripeness stages, colors, tips
├── .env.local
├── .env.example
├── CLAUDE.md
├── README.md
└── ROADMAP.md
```

## Architecture Decisions

### Why PWA over React Native?

PWA keeps the entire stack in Next.js — same framework as JobPilot, no new toolchain to learn. Users can install it to their home screen and it works offline for viewing past scans. Deployment is just Vercel, no App Store submission needed.

### Why GPT-4o Vision over custom model?

Training a fruit ripeness model requires thousands of labeled images and weeks of iteration. GPT-4o Vision achieves excellent results with a well-crafted prompt, and the API cost is ~$0.01 per image. The project's goal is demonstrating full-stack skills, not ML research.

### Why client-side image compression?

Mobile photos are typically 3-8MB. Uploading uncompressed images wastes bandwidth and hits OpenAI's token limits. Compressing to ~500KB client-side before upload reduces latency by 60-80% and keeps API costs low.

### Why track banana ripeness over time?

This transforms the app from a one-shot tool into something users return to daily. It also demonstrates time-series data visualization skills (Recharts) and gives the project more depth for interviews.

## Coding Conventions

### General

- Always use TypeScript strict mode. Never use `any`.
- Use `type` for object shapes, `interface` only when extending.
- Prefer named exports except for page.tsx files.
- Use absolute imports with `@/` prefix.
- Error handling: try-catch in all Server Actions, return structured error objects.

### Components

- Functional components with arrow function syntax.
- Props type named `{ComponentName}Props`.
- Use `cn()` utility for conditional class names.
- Client Components must have `"use client"` directive.
- Mobile-first design: all components must look good on 375px width.

### Naming

- Files: kebab-case (`ripeness-badge.tsx`)
- Components: PascalCase (`RipenessBadge`)
- Functions/variables: camelCase (`analyzeImage`)
- Constants: SCREAMING_SNAKE_CASE (`RIPENESS_STAGES`)

### Server Actions

- Validate input with Zod.
- Check authentication with `auth()`.
- Return `{ success: true, data }` or `{ success: false, error }`.
- Use `revalidatePath()` after mutations.

### Styling

- Tailwind CSS only. No custom CSS files.
- Mobile-first: design for 375px, then scale up with sm/md/lg.
- Color palette: Yellow (unripe), Green (perfect), Brown (overripe).
- Rounded corners, large touch targets (min 44px), playful but professional.

## Key Features

### 1. Camera / Upload

- Access device camera via MediaDevices API (rear camera preferred)
- Fallback to file upload for desktop or denied camera permissions
- Client-side compression to ~500KB before upload
- Preview image before analyzing
- Large, centered "Scan" button — optimized for one-handed mobile use

### 2. AI Ripeness Analysis

- Send compressed base64 image to GPT-4o Vision
- Structured prompt returns JSON:
  ```json
  {
    "ripenessPercent": 72,
    "stage": "Ripe",
    "daysUntilSpoiled": 2,
    "color": "Yellow with brown spots",
    "recommendation": "Perfect for eating fresh right now",
    "recipe": null
  }
  ```
- Stages: Unripe (0-25%), Nearly Ripe (25-50%), Ripe (50-75%), Overripe (75-100%)
- When overripe, suggest a recipe (banana bread, smoothie, pancakes)

### 3. Scan History

- List of all past scans with thumbnail, date, ripeness score
- Click to view full analysis result
- Delete old scans

### 4. Banana Tracking (The "Cool" Feature)

- "Track this banana" button on result page
- Scan the same banana daily, app groups scans into a timeline
- Recharts line graph showing ripeness % over days
- Predicted spoilage date based on ripeness trend
- This is what makes the project unique — no one else has this

## Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
OPENAI_API_KEY="sk-..."
```

## Git Commit Convention

- `feat: add camera capture with rear-camera preference`
- `fix: resolve image compression on iOS Safari`
- `style: improve mobile scan button touch target`
- `docs: update README with demo screenshots`

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```
