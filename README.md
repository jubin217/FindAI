# FindAI (findai.store)

FindAI is a premium, high-performance, responsive AI tools discovery and comparison platform built with **React 19**, **TypeScript**, **Vite**, and **Supabase**. It showcases interactive 3D physics cards, bento grid layouts, multi-tool sandbox comparison grids, and a lexical daily crawler pipeline for automatic directory updates.

---

## 🌟 Key Features

*   **Interactive 3D Physics Cards & Buttons:** Core UI components use tactile 3D perspective rotates, custom shadow glare highlights, and hardware-accelerated transforms.
*   **3D Showcase WebGL Orb:** A rotating card showcase built on custom rendering grids, neon outlines, and diagonal glint transitions.
*   **Responsive Bento Grid & Timeline:** A bento-grid feature display alongside an interactive developer pipeline timeline showing project integration status.
*   **Multi-Product Comparison Sandbox:** Select up to 4 AI products to evaluate side-by-side inside a glassmorphic sliding comparing drawer.
*   **Smart Search Autocomplete:** Features instant suggestions popovers categorizing tools matching users query strings.
*   **Automatic Daily Crawl & AI Summaries:** Auto-synchronization pipeline that fetches new tools, runs Gemini summaries, updates the Supabase DB, and commits cached list records to Git.
*   **Professional Light/Dark Themes:** Supports system default styling matching light/dark modes natively with high-contrast pastel labels and coordinate grids.

---

## 🛠️ Technology Stack

*   **Frontend Library:** React 19 (Functional Components & Hooks)
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Database & Auth:** Supabase Database Adapter Client
*   **Icons:** Lucide React
*   **Styling:** Custom Vanilla CSS with GPU-accelerated 3D effects

---

## 📁 Repository Structure

```text
├── .github/workflows/    # GitHub actions daily sync cron jobs
├── public/               # Public assets (icons, canvas textures, robots.txt)
├── scripts/              # Crawler sync scripts and sitemaps generator
├── src/
│   ├── components/       # UI Components (3D Bento, Modals, Header, Footer)
│   ├── data/             # Cached static baseline tools database
│   ├── hooks/            # Custom hooks (Lenis scroll, lock-scroll, etc.)
│   ├── lib/              # Supabase Client initializations
│   ├── App.tsx           # Main Directory Router and Shell Layout
│   ├── index.css         # Typography, Variables, and CSS Themes System
│   └── main.tsx          # Application Entry mount
├── index.html            # Entry HTML template with SEO Meta & JSON-LD
└── package.json          # Node scripts, dependencies, build settings
```

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
Ensure you have [Node.js (v18+)](https://nodejs.org) and `npm` installed.

### 2. Clone the Repository
```bash
git clone https://github.com/jubin217/FindAI.git
cd FindAI
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY
GH_PAT=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
```

### 5. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📦 Production Builds & Sitemaps

To compile the application:
```bash
npm run build
```
This script automatically executes two tasks:
1. Runs `scripts/generate_sitemap.js` to compile a fresh `sitemap.xml` mapping all baseline tools.
2. Compiles TypeScript models and outputs the optimized production build to `/dist`.

---

## 🤖 Automated Data Sync (GitHub Actions)

FindAI features an automated data synchronization workflow located in `.github/workflows/sync-tools.yml`.

Every day at midnight (configured via `cron: '0 0 * * *'`), GitHub Actions runs the synchronizer:
1. Installs project dependencies.
2. Runs `node scripts/sync_famous_tools.js` to pull new AI tools.
3. Classifies categories, summarizes descriptions using Gemini, and pushes products to Supabase.
4. Generates an updated local cached array in `src/data/tools.ts`.
5. Pushes code back to Git, triggering automatic Vercel/Netlify hosting redeployments.

*Note: Ensure action workflow permissions are set to "Read and write permissions" in your GitHub repository actions settings.*

---

## 🌐 Deployment & Custom Domains

We recommend deploying to **Vercel** for instant edge performance:
1. Create a project in Vercel and import your repository.
2. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables.
3. In **Settings > Domains**, add your custom domain (e.g. `findai.store`).
4. Set up A/CNAME records in your DNS registrar pointing to Vercel's IP (`76.76.21.21`).
