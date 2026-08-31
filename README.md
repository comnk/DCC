# DCC — Design Co Marketing Command Center

DCC is a centralized internal platform for the Design Co (DCo) marketing team. It
brings campaign planning, content creation, approvals, and scheduling into a
single workspace so the team no longer has to track work across Google Docs,
Slack, Notion, and manual posting.

The goal is to be a **single source of truth for campaign operations**: structured
approval workflows, less manual publishing effort, and clear visibility and
accountability across the whole campaign lifecycle. DCC is meant to enhance the
team's existing process, not replace the tools it already relies on.

## Why this exists

As campaigns grow more complex, the current workflow runs into friction:

- Campaign details, drafts, and feedback live across multiple platforms.
- Approval tracking is informal and needs manual follow-up — there's no automatic
  ping when a post needs someone's attention.
- Publishing means posting to each platform by hand.
- Timelines are scattered, so it's hard to see status across all active campaigns
  at a glance.

## What DCC does

| Area | Capability |
| --- | --- |
| **Campaign management** | Create, edit, archive, and delete campaigns; assign team members; view every post attached to a campaign; per-campaign task summaries. |
| **Unified post composer** | Draft a single post targeting one or more platforms (Instagram, LinkedIn, Discord), write captions/titles, attach media, and preview per platform before submitting. |
| **Approval workflow** | Submit posts for review, approve or reject with feedback, and track approval history. Only designated roles can approve; rejected posts return to draft for editing. |
| **Tasks** | Attach role- or user-based tasks (e.g. copy, design) to a post with due dates and completion tracking; see "my tasks" and "tasks by role". |
| **Scheduling & publishing** | Set a publish date/time on an approved post. A background scheduler publishes due posts automatically and retries on failure, marking the post `failed` if it can't. |
| **Views** | List views (filterable by campaign, status, platform) and a calendar view of scheduled content; a team timeline view of activity. |
| **Auth & profiles** | Supabase-backed auth including Google sign-in, an onboarding flow, and user profiles with marketing roles. |

### Roles

Onboarding assigns each user a role, used to gate approvals and route tasks:
Content Writer, Designer, Media Coordinator, Social Media Coordinator, Marketing
Lead, or a custom role.

### Post workflow states

The intended lifecycle is **Draft → In Review → Approved → Scheduled → Posted**,
with **Rejected** returning a post to draft and **Failed** flagging a publish that
did not go through. Editing an approved post can require re-review. (State names
in the current code: `draft`, `in_review`, `scheduled`, `publishing`,
`published`/`posted`, `rejected`, `failed`.)

## Tech stack

**Frontend** — Next.js (App Router) 16 / React 19, MUI, Sass, FullCalendar,
Swiper, `@supabase/ssr` + `@supabase/supabase-js`.

**Backend** — FastAPI, Supabase (Postgres + Auth + Storage), APScheduler for
background publishing. Platform integrations: `instagrapi` / Instagram Graph,
LinkedIn REST API, a Discord bot.

## Project structure

```
backend/
  app/
    main.py          # FastAPI app + APScheduler lifespan (publish tick every 30s)
    routers/         # auth, profile, campaign, post, task route handlers
    models/          # Pydantic request models
    schemas/         # Pydantic schemas for DB entities (post, campaign, user, ...)
    services/
      instagram/     # Instagram Graph container create/publish
      linkedin/      # LinkedIn auth, media upload, posting
      discord/       # Discord bot posting + scheduled events
      scheduling/    # check_and_publish_posts: due-post polling + retry
      posts/, tasks/ # post and task service logic
    db/              # Supabase client setup
    utils/           # ownership checks, token extraction, completeness checks
  tests/
frontend/
  app/               # pages: dashboard, campaign, posts, review, timeline,
                     #        login, signup, onboarding, profile
  components/         # forms, cards, calendars, previews, search bars, buttons
  lib/               # api client, supabase clients, post upload helpers
  hooks/, utils/, types/
```

## API surface

Base URL defaults to `http://localhost:8000`. Auth is a Supabase JWT sent as
`Authorization: Bearer <token>`.

- `GET  /users/{user_id}`, `PUT /users/update-profile`
- `GET  /profile/all`, `GET /profile/{user_id}`, `PUT /profile/update`
- `POST /campaigns/create`, `GET /campaigns/list`, `GET|PUT /campaigns/{id}`,
  `POST /campaigns/{id}/toggle_archive`, `DELETE /campaigns/{id}`
- `GET  /campaigns/{id}/posts`, `.../members` (GET/POST/DELETE),
  `.../task-summary`
- `POST /posts/create`, `GET /posts/all`, `GET /posts/{id}`,
  `PUT /posts/{id}` (update)
- `GET  /posts/need_review`, `GET /posts/need_review/count`
- `PUT  /posts/{id}/submit_for_review`, `/review`, `/reject`, `/cancel_post`
- `DELETE /posts/{id}`, `DELETE /posts/{id}/delete_image`
- `POST|GET /posts/{post_id}/tasks`
- `GET  /tasks/my-tasks`, `GET /tasks/by-role`,
  `PATCH /tasks/{id}`, `POST /tasks/{id}/complete`, `DELETE /tasks/{id}`

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

Runs at `http://localhost:8000`. On startup, APScheduler begins polling for due
scheduled posts every 30 seconds.

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

Platform credentials use dummy DCo accounts for testing.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`.

Required environment variables (`frontend/.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

- **Frontend** → Vercel.
- **Backend** → Railway (`railway.toml` runs
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`). A `vercel.json` is also
  present for deploying the FastAPI app to Vercel.

## Roadmap

The build is planned in four stages.

**Stage 1 — MVP.** Monorepo setup, Next.js + FastAPI + Supabase, auth with a
basic role system, campaign CRUD + archive, unified post composer v1 (drafts,
captions, media upload to cloud storage), and list-view dashboards for campaigns
and posts.

**Stage 2 — Approval workflow & visibility.** Post status system
(Draft → In Review → Approved → Rejected → Scheduled → Posted), submit / approve /
reject-with-feedback, workflow rules (only certain roles approve; rejected posts
return to draft; editing an approved post requires re-review), status indicators,
calendar view, and filtering by campaign / status / platform / assignee.

**Stage 3 — Automated publishing.** Background job system with scheduled jobs
persisted in the database, scheduling UI (pick date/time, schedule, reschedule,
cancel), publishing via platform APIs (Instagram, LinkedIn, Discord), and failure
handling with automatic retries and a clear failed state.

**Stage 4 — Notifications & insights.** Notify users on review requests,
approvals/rejections, and publish failures across Slack / email / SMS; basic
campaign insights (engagement metrics, activity overview, post performance).

### Later / possible enhancements

Automated performance tracking, a content idea bank, a brainstorming/planning
canvas, optimal posting-time recommendations, and campaign templates.

## Success criteria

- All active marketing campaigns tracked in DCC.
- Fewer manual scheduling steps.
- Clear visibility into post status across campaigns.
- Zero missed scheduled posts.
</content>
</invoke>
