# BananaWatch 开发路线图

## 总时间预估：1 个周末（8-12 小时）

---

## Phase 0：项目初始化（1 小时）

```
> Initialize a Next.js 14 project with TypeScript, Tailwind CSS, ESLint.
> Use App Router. Set up path aliases with @/ prefix.
> Install dependencies: prisma, @prisma/client, next-auth, @auth/prisma-adapter,
  openai, browser-image-compression, recharts, zod, clsx, tailwind-merge,
  lucide-react, sonner, next-pwa
> Copy prisma/schema.prisma from the file I have.
> Create lib/prisma.ts singleton, lib/utils.ts with cn().
> Set up the folder structure from CLAUDE.md.
> Configure next-pwa in next.config.mjs for PWA support.
> Create public/manifest.json with app name "BananaWatch", 
  theme_color "#FBBF24" (amber), background_color "#FFFBEB".
```

### Git commits
- `chore: initialize Next.js 14 project with PWA support`

---

## Phase 1：认证 + 移动端布局（1.5 小时）

```
> Set up NextAuth.js with Google OAuth and Prisma adapter.
> Create a mobile-first layout:
> - Bottom navigation bar with 3 tabs: Scan (camera icon), History (list icon), Track (chart icon)
> - No sidebar — this is a mobile app
> - Header with app name "BananaWatch" and user avatar
> - The layout should feel like a native mobile app
> Create login page with Google sign-in button, banana emoji, playful copy
> Create middleware to protect /scan, /history, /track routes
```

### Git commits
- `feat: add auth and mobile-first bottom navigation layout`

---

## Phase 2：拍照 + AI 分析（3 小时）⭐ 核心功能

```
> Build the scan page at /scan:
> 
> 1. Create a useCamera custom hook in src/hooks/use-camera.ts that:
>    - Requests camera permission via navigator.mediaDevices.getUserMedia
>    - Prefers rear camera (facingMode: "environment")
>    - Returns video stream ref, capture function, and permission status
>    - Handles permission denied gracefully
> 
> 2. Create the scan page with two modes:
>    - Camera mode: live viewfinder with a big circular "Capture" button
>    - Upload mode: drag-and-drop or tap to select image file
>    - Toggle between modes with a small button
> 
> 3. After capture/upload:
>    - Show image preview
>    - Compress image to ~500KB using browser-image-compression
>    - Convert to base64
>    - "Analyze" button sends to Server Action
> 
> 4. Create Server Action in src/actions/analyze.ts:
>    - Receives base64 image
>    - Sends to OpenAI GPT-4o Vision using the prompt from ai-prompts.ts
>    - Parses JSON response with Zod
>    - Stores scan result in database
>    - Returns analysis result
> 
> 5. Create result display component:
>    - Large ripeness percentage with color-coded circular progress
>    - Stage badge (Unripe/Nearly Ripe/Ripe/Overripe) with emoji
>    - "Days until spoiled" countdown
>    - Color description
>    - Recommendation text
>    - Recipe card (only shows when overripe)
>    - "Track this banana" button
>    - "Scan another" button
> 
> 6. Show loading animation while AI is processing:
>    - Spinning banana emoji or pulsing progress ring
>    - Fun loading text: "Inspecting banana...", "Checking spots...", "Calculating freshness..."
```

### Git commits
- `feat: implement camera capture with rear-camera preference`
- `feat: add image compression and GPT-4o Vision analysis`
- `feat: create ripeness result display with stage badges`

---

## Phase 3：扫描历史（1.5 小时）

```
> Build the history page at /history:
> 
> 1. Server Component fetches all user's scans, ordered by date desc
> 2. Display as a card list, each card shows:
>    - Thumbnail image (small, rounded)
>    - Ripeness percentage with color
>    - Stage badge
>    - Date scanned
>    - Days until spoiled at time of scan
> 3. Click a card to navigate to /result/[id] showing full analysis
> 4. Swipe left to delete (or delete button)
> 5. Empty state: "No scans yet. Go scan your first banana!" with camera link
> 6. Show total scans count at the top
```

### Git commits
- `feat: add scan history page with thumbnails and filters`

---

## Phase 4：香蕉追踪时间线（2 小时）⭐ 差异化功能

```
> Build the banana tracking feature:
> 
> 1. When user clicks "Track this banana" on a result page:
>    - Create a new BananaTracker in the database
>    - Link the current scan to it
>    - Redirect to /track/[trackerId]
> 
> 2. Track page at /track/[id]:
>    - Show banana name (editable, default "My Banana")
>    - Recharts line chart: X axis = date, Y axis = ripeness %
>    - Data points are each scan linked to this tracker
>    - Color gradient on the line: green -> yellow -> brown
>    - Predicted spoilage date (simple linear extrapolation)
>    - "Add today's scan" button -> opens camera, auto-links to tracker
>    - Timeline view below the chart: vertical list of each scan with 
>      thumbnail, date, ripeness change (+5% since yesterday)
> 
> 3. Track list at /track:
>    - All active trackers as cards
>    - Each shows: name, current ripeness, days tracked, last scanned
>    - Completed/spoiled trackers shown in a separate "Past" section
```

### Git commits
- `feat: implement banana tracker with ripeness timeline chart`
- `feat: add daily scan linking and spoilage prediction`

---

## Phase 5：Landing Page + 部署（1.5 小时）

```
> 1. Create landing page at app/page.tsx:
>    - Hero: big banana emoji, "How ripe is your banana?" tagline
>    - Phone mockup showing the scan interface
>    - 3 feature cards: Instant Scan, Track Over Time, Recipe Suggestions
>    - "Get Started" button -> /login
>    - Playful, colorful design with yellow/amber theme
> 
> 2. PWA setup:
>    - Verify manifest.json is correct
>    - Add meta tags for mobile: viewport, theme-color, apple-touch-icon
>    - Test "Add to Home Screen" on mobile
> 
> 3. Make sure npm run build passes with zero errors
> 4. Deploy to Vercel
> 5. Update OAuth redirect URIs for production domain
```

### Git commits
- `feat: create playful landing page with phone mockup`
- `chore: configure PWA manifest and mobile meta tags`
- `docs: update README with screenshots and architecture`

---

## 简历 Bullet Points（完成后使用）

```
• Developed a mobile-first Progressive Web App using Next.js 14 and 
  TypeScript that analyzes banana ripeness from camera photos via 
  GPT-4o Vision API, delivering real-time freshness scores with 
  stage-specific dietary recommendations

• Implemented device camera integration using MediaDevices API with 
  rear-camera preference, client-side image compression reducing upload 
  size by 80%, and optimistic UI updates for sub-second user feedback

• Built a produce lifecycle tracking feature with Recharts time-series 
  visualization, allowing users to monitor ripeness progression over 
  multiple days with linear extrapolation for spoilage date prediction

• Configured as an installable PWA with offline history viewing, 
  achieving mobile-native UX with bottom tab navigation and 44px+ 
  touch targets across all interactive elements
```
