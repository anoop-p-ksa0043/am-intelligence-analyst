# Intelligence Observer

**Internal AM/CS tooling platform** that transforms public account signals into explainable Zoho product recommendations. Rules-led, human-review-gated. No autonomous customer-facing execution.

## 🚀 Live Deployment
**URL:** https://am-intelligence-analyst.vercel.app/

## 🔐 Login Credentials
Use any of the following accounts (all use password: `demo1234`):

| Email | Role | Name |
|-------|------|------|
| `am@internal.dev` | Account Manager | Jordan Diaz |
| `cs@internal.dev` | Customer Success | Priya Menon |
| `analyst@internal.dev` | Analyst | Omar Rahman |
| `steward@internal.dev` | Data Steward | Amina Shah |
| `pmm@internal.dev` | Portfolio Manager | Alex Torres |

## Features
- 🎯 Account-centric intelligence workbench with real-time profile enrichment
- 📊 AI-powered recommendations with 18 Zoho products and weighted scoring rules
- 🔍 Evidence-based recommendation rationale with data lineage tracking
- ✅ Human-in-the-loop review queue with approval workflow
- 👥 Role-gated UI (Account Manager, Customer Success, Analyst, Data Steward, PMM)
- 📱 Fully responsive design (mobile + desktop)
- 🌙 Dark mode design system with Material Symbols

## Tech Stack
- **Frontend:** Next.js 16.2.1, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Node.js
- **Database:** PostgreSQL (Neon) with Prisma v7
- **Auth:** NextAuth.js v5 (JWT-based)
- **AI Enrichment:** Google Gemini 2.5 with keyword fallback
- **Design:** Material Design system, Space Grotesk + Inter fonts
- **Deployment:** Vercel (GitHub integration)

## Setup Instructions

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/anoop-p-ksa0043/am-intelligence-analyst.git
   cd am-intelligence-analyst
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env.local`):
   ```env
   DATABASE_URL=your_neon_postgresql_url
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ENABLE_REVAMP_UI=true
   ```

4. Run database migrations and seed:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 and log in with any credentials above.

## Project Structure
- `app/` — Next.js routes and pages
- `components/` — React UI components
- `lib/` — Domain types, services, utilities, AI enrichment
- `prisma/` — Database schema and seed scripts
- `docs/` — Architecture, design, handoff documentation
- `skills/` — Domain-specific agent knowledge base

## Documentation
See `docs/` folder for detailed information:
- `architecture/` — System design and ADRs
- `design/` — UI/UX specifications
- `data/` — Data model documentation
- `handoff/` — Current status, backlog, and decision log