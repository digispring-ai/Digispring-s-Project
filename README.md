# Digispring

Full-stack application connecting GitHub, Supabase, Vercel, and Render.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Supabase   │
│  (Next.js)  │     │  (Express)  │     │  (Database) │
│   Vercel    │     │   Render    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       └───────────────────┘
              GitHub Actions CI/CD
```

## Services

| Service | Purpose | Config |
|---------|---------|--------|
| **GitHub** | Source control & CI/CD | `.github/workflows/` |
| **Supabase** | Database & Authentication | `supabase/` + `frontend/lib/supabase/` |
| **Vercel** | Frontend deployment (Next.js) | `frontend/vercel.json` |
| **Render** | Backend deployment (Express API) | `backend/render.yaml` |

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd digispring
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure Environment Variables

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
```

### 3. Run Locally

```bash
# From project root
npm run dev
```

## Deployment

### GitHub Secrets Required

Add these secrets to your GitHub repository (`Settings > Secrets > Actions`):

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Render backend URL |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `RENDER_API_KEY` | Render API key |
| `RENDER_SERVICE_ID` | Render service ID |

### Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) and import the GitHub repo
2. Set root directory to `frontend`
3. Add environment variables from `frontend/.env.example`
4. Deploy

### Render (Backend)

1. Go to [render.com](https://render.com) and create a new Web Service
2. Connect GitHub repo, set root directory to `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables from `backend/.env.example`

### Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy Project URL and anon key to environment variables
3. Run migrations: `supabase db push`

## CI/CD

- **Push to any branch**: Runs linting and build checks
- **Push to `main`**: Triggers automatic deployment to Vercel and Render
