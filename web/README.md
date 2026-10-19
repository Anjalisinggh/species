# Firstform (Next.js + Supabase)

## Setup
1. Create a project at supabase.com.
2. SQL editor: run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.local.example` to `.env.local` and fill in the project URL and anon key (Project Settings → API).
4. Authentication → Providers → Email. For quick local testing, turn off "Confirm email".
5. `npm install && npm run dev` → http://localhost:3000
6. Sign up in the app, then make yourself a moderator in the SQL editor:
   `update profiles set role = 'admin' where id = '<your auth user id>';`
   A "Moderate" button then appears in the header (`/admin`).

## How the rules are enforced
- XP, quest review and evolution live in SQL functions (`claim_reward`, `review_submission`, `check_evolution`), not in the client or in AI.
- Row-level security: users can only read/write their own follows, submissions and posts; only moderators can verify.
- Evolution criteria are public rows and have no write policy, so they can't be changed through the API.

## Not built yet
AI art/story generation and AI chat, image uploads, onchain/wallet features, battles, notifications.
