# DCC

DCC is a social media campaign management platform for teams. It lets a team plan
marketing **campaigns**, draft and schedule **posts** across multiple platforms
(Instagram, LinkedIn, and Discord), assign **tasks** to teammates, and run
posts through a review/approval workflow before they go live.

A background scheduler polls for due posts and publishes them automatically,
with retries on failure.

## Features

- **Campaigns** — create, update, archive, and delete campaigns; add/remove team
  members per campaign.
- **Posts** — draft posts targeting one or more platforms at once, attach media,
  and schedule a publish time.
- **Review workflow** — submit posts for review, approve or reject with
  feedback, and track approval history.
- **Tasks** — assign role- or user-based tasks (e.g. copywriting, design) to a
  post, track due dates and completion.
- **Multi-platform publishing** — Instagram (photo/video/carousel/story),
  LinkedIn, and Discord (including scheduled Discord events), handled by a
  background job that publishes due posts and retries on failure.
- **Calendar & timeline views** — visualize campaigns and posts on a calendar,
  and see team activity on a timeline.
- **Auth & profiles** — Supabase-backed auth (including Google sign-in),
  onboarding flow, and user profiles with roles (content writer, designer,
  marketing lead, etc.).

## Tech stack

**Frontend** — Next.js (App Router) / React, MUI, Sass, FullCalendar, Supabase
JS client.

**Backend** — FastAPI, Supabase (Postgres + Auth + Storage), APScheduler for
background post publishing.

## Project structure

```
backend/
  app/
    routers/       # FastAPI route handlers (auth, profile, campaign, post, task)
    models/        # Pydantic request models
    schemas/       # Pydantic schemas for DB entities
    services/      # Platform integrations (instagram, linkedin, discord),
                    # post-publishing scheduler, tasks
    db/            # Supabase client setup
frontend/
  app/             # Next.js pages (dashboard, campaign, posts, review, timeline, ...)
  components/      # Shared UI components (forms, cards, calendars, previews, ...)
  lib/, hooks/, utils/, types/
```

## Getting started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in the values below
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

Required environment variables (`backend/.env`):

```
SUPABASE_DB_URL=
SUPABASE_DB_KEY=

SUPABASE_GOOGLE_CLIENT=
SUPABASE_GOOGLE_CALLBACK_URL=

INSTAGRAM_USERNAME=
INSTAGRAM_PASSWORD=

LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_REFRESH_TOKEN=
LINKEDIN_PERSON_URN=
LINKEDIN_ORG_URN=
LINKEDIN_REDIRECT_URI=

DISCORD_TOKEN=
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`. It expects the Supabase project URL/
anon key (see `frontend/.env`) and the backend API URL to be configured.

## Deployment

- **Frontend** deploys to Vercel.
- **Backend** deploys to Railway (`railway.toml` runs
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`); a `vercel.json` is also
  present for deploying the FastAPI app to Vercel.
