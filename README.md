# Councillor's Desk – Area 18

A modern full-stack civic engagement platform for **Area 18, Lilongwe, Malawi**. Residents can report community issues, follow progress, interact with ward leadership, read the community magazine, and receive updates via in-app notifications, email, and SMS.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | ASP.NET Core 8 Web API |
| Database | PostgreSQL |
| Auth | JWT, Google OAuth, Email/Password |
| Images | Local storage (dev) / Cloudinary (production) |
| PDF | QuestPDF + QR codes |
| Notifications | In-app + SMTP email + Twilio SMS |

## Project Structure

```
├── backend/                    # ASP.NET Core solution
│   ├── CouncillorsDesk.Api/    # REST API, Dockerfile, render.yaml
│   ├── CouncillorsDesk.Core/   # Entities, DTOs, interfaces
│   └── CouncillorsDesk.Infrastructure/  # EF Core, services, migrations
├── frontend/                   # Next.js app (Vercel-ready)
├── docker-compose.yml          # Local PostgreSQL
└── README.md
```

## Features

### Citizens
- Register / login (email or Google OAuth)
- Report issues with photos, categories, and public/private visibility
- Download PDF receipt with tracking number and QR code
- Search and filter issues; edit before review
- Community feed (posts, comments, replies, likes, follows)
- Community magazine articles
- Area 18 interactive map
- In-app notifications (+ email/SMS when configured)

### Councillors & Administrators
- Separate secure login portal
- Dashboard with issue management, private reports, moderation
- Status updates, progress photos, official responses
- Announcements and magazine publishing
- Content moderation

### Transparency
- Public stats dashboard (totals, resolution rate, categories)
- SEO-ready pages with sitemap and Open Graph metadata

---

## Local Development

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- PostgreSQL 16 (via Docker or local install)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

Or use your own PostgreSQL instance and update the connection string.

**Supabase (alternative):** Create a project at [supabase.com](https://supabase.com), copy the PostgreSQL connection string from **Settings → Database**, and use it as `ConnectionStrings__DefaultConnection`.

### 2. Backend

```bash
cd backend
dotnet restore
dotnet run --project CouncillorsDesk.Api
```

The API runs at **http://localhost:8080**

- Swagger UI: http://localhost:8080/swagger (Development only)
- Health check: http://localhost:8080/health

On first run, migrations apply automatically and seed data is inserted.

**Google OAuth (local backend)** — do not put secrets in `appsettings*.json`. Copy `backend/.env.example` to `backend/.env` (gitignored) or use user secrets:

```bash
cd backend/CouncillorsDesk.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=councillors_desk_dev;Username=postgres;Password=YOUR_DB_PASSWORD"
dotnet user-secrets set "Jwt:Secret" "YOUR_LOCAL_JWT_SECRET_AT_LEAST_32_CHARS"
dotnet user-secrets set "Google:ClientId" "YOUR_GOOGLE_CLIENT_ID"
dotnet user-secrets set "Google:ClientSecret" "YOUR_GOOGLE_CLIENT_SECRET"
dotnet user-secrets set "SUPER_ADMIN_PASSWORD" "YOUR_SUPER_ADMIN_PASSWORD"
```

Or set the same keys as environment variables (see root `.env.example`).

**Local PostgreSQL:** copy `docker-compose.env.example` to `docker-compose.env`, then run `docker compose up -d`.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000**

### Super Admin (first run)

Set `SUPER_ADMIN_PASSWORD` before starting the API. On first run, an admin account is created for the configured super admin email (`novielungu@gmail.com`).

---

## Environment Variables

### Backend (`backend/.env.example`)

| Variable | Description |
|----------|-------------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `Jwt__Secret` | JWT signing key (32+ characters) |
| `Google__ClientId` | **Required** — Google OAuth client ID (ID token validation) |
| `Google__ClientSecret` | **Required on Render** — Google OAuth client secret |
| `SUPER_ADMIN_PASSWORD` | Password for first-run super admin account creation |
| `Smtp__*` | Email notifications (MailKit) |
| `Twilio__*` | SMS notifications |
| `Cloudinary__*` | Cloud image storage (optional) |
| `App__FrontendUrl` | Frontend URL for CORS & reset links |

### Frontend (`frontend/.env.local.example`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `http://localhost:8080`) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for SEO |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## Deployment

### Backend → Render

1. Push the repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), create a **Blueprint** from `backend/render.yaml`, or:
   - **New → Web Service** → connect repo
   - **Root directory:** `backend`
   - **Runtime:** Docker
   - **Dockerfile path:** `CouncillorsDesk.Api/Dockerfile`
   - **Health check path:** `/health`
3. Set environment variables in the Render dashboard (see `backend/.env.example` and `backend/render.yaml`):
   - `App__FrontendUrl` → your Vercel URL
   - `Jwt__Secret` → strong random string (or use Render generated value)
   - **`Google__ClientId`** → your Google OAuth client ID
   - **`Google__ClientSecret`** → your Google OAuth client secret (never commit this)
   - **`SUPER_ADMIN_PASSWORD`** → strong password for super admin bootstrap
   - Enable `Smtp__Enabled=true` and configure SMTP for email alerts
   - Configure `Twilio__*` for SMS alerts
   - Configure `Cloudinary__*` for persistent image storage (Render disk is ephemeral)
4. For database, either use Render PostgreSQL (defined in `render.yaml`) or **Supabase**:
   - Supabase → Settings → Database → Connection string (URI)
   - Set as `ConnectionStrings__DefaultConnection`

### Frontend → Vercel

1. Import the repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```
4. Update `frontend/vercel.json` rewrite destination to your Render API URL (optional proxy).
5. Deploy.

### Google OAuth Setup

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized JavaScript origins: `http://localhost:3000`, your Vercel URL
4. Authorized redirect URIs: same origins
5. Copy Client ID to frontend and backend env vars

---

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Citizen registration |
| `POST /api/auth/login` | Citizen login |
| `POST /api/auth/councillor-login` | Councillor login |
| `POST /api/auth/google` | Google OAuth |
| `GET /api/issues` | Search/filter issues |
| `POST /api/issues` | Create issue report |
| `GET /api/issues/{id}/receipt` | Download PDF receipt |
| `GET /api/feed/posts` | Community feed |
| `GET /api/magazine` | Published magazine articles |
| `GET /api/transparency/stats` | Public transparency stats |
| `GET /api/notifications` | User notifications |
| `GET /health` | Health check |

Full API documentation available via Swagger in Development mode.

---

## Architecture

Clean architecture with separation of concerns:

- **Core** — Domain entities, DTOs, service interfaces
- **Infrastructure** — EF Core repositories, PostgreSQL, email/SMS/PDF/image services
- **Api** — Controllers, middleware, authentication, CORS

Private issue reports use a shadow `IsPrivate` column; visibility is enforced in `IssueService` so only reporters, councillors, and administrators can access them.

---

## Issue Workflow

`Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved` → `Closed`

Tracking numbers format: `A18-YYYYMMDD-XXXX`

---

## License

Built for Area 18 Ward, Lilongwe City Council, Malawi.
