# Superteam Malaysia Frontend

The official frontend for Superteam Malaysia — a community platform for Solana builders, creators, and founders in Malaysia.

Built with React 19, TypeScript, Vite 7, Tailwind CSS 4, Framer Motion, Privy (Web3 auth), and Supabase.

## Prerequisites

- **Node.js** >= 18 (recommended: 20+)
- **npm** >= 9

## Environment Variables

Create a `.env` file in the project root:

```env
# Privy — Web3 authentication provider
VITE_PRIVY_APP_ID=your_privy_app_id

# Supabase — database & storage (auth handled by Privy)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

| Variable | Description | Where to get it |
|---|---|---|
| `VITE_PRIVY_APP_ID` | Privy application ID | [Privy Dashboard](https://dashboard.privy.io/) |
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase project > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase project > Settings > API |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/superteammy-fe.git
cd superteammy-fe
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because `react-simple-maps` has not updated its peer dependency to support React 19 yet. The `.npmrc` file includes this flag so subsequent `npm install` calls will use it automatically.

### 3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your actual keys
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check with TypeScript then build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/              # Shared UI components
│   ├── Navigation.tsx       # Sticky header with mobile hamburger menu
│   ├── Hero.tsx             # Landing hero with rotating text + Malaysia map
│   ├── Mission.tsx          # 6 pillar cards
│   ├── Stats.tsx            # Animated stat counters
│   ├── Events.tsx           # Luma calendar embed
│   ├── Members.tsx          # Featured member cards
│   ├── Partners.tsx         # Scrolling partner logo tape
│   ├── Testimonials.tsx     # Community quotes
│   ├── FAQ.tsx              # Accordion FAQ
│   ├── JoinCTA.tsx          # Call-to-action section
│   ├── Footer.tsx           # Footer with links and socials
│   ├── MalaysiaMap.tsx      # Interactive SVG map
│   └── admin/
│       └── AdminLayout.tsx  # Admin sidebar layout
├── pages/
│   ├── MemberDirectoryV2.tsx    # Public member directory
│   ├── LoginPage.tsx            # Privy authentication
│   └── admin/                   # Admin portal pages
│       ├── DashboardPage.tsx
│       ├── EventsPage.tsx
│       ├── MembersPage.tsx
│       ├── PartnersPage.tsx
│       ├── ProjectsPage.tsx
│       ├── AnnouncementsPage.tsx
│       └── LandingPage.tsx      # Landing page CMS
├── context/
│   └── AuthContext.tsx      # Privy + Supabase auth provider
├── hooks/
│   └── useCms.ts            # Generic CRUD hooks for Supabase tables
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── database.types.ts    # Database type definitions
├── App.tsx                  # Route definitions
└── index.css                # Design tokens & global styles
```

## Deployment (Vercel)

The project includes a `vercel.json` with SPA rewrites and the install command configured to use `--legacy-peer-deps`.

1. Push to your Git repository
2. Connect the repo in [Vercel](https://vercel.com)
3. Add the three `VITE_*` environment variables in Vercel project settings
4. Deploy

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations |
| Privy | Web3 wallet + email authentication |
| Supabase | PostgreSQL database & storage |
| React Router 7 | Client-side routing |
| Lucide React | Icon library |
