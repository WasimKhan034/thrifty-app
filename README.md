# Thrifty

Thrifty is a Vite + React + TypeScript thrift discovery app structured for a Supabase backend and Vercel deployment.

## What is included

- Vite + React + TypeScript project structure
- React Router app shell
- Vintage-themed explore, contribute, saved, auth, and admin pages
- Local demo repository so the app still works before Supabase is configured
- Supabase-ready client and repository boundary for future backend wiring
- Pending submission workflow for admin approval
- Favorites, visited places, reviews, and map-based browsing

## Local development

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Build for production:
   `npm run build`

## Environment

Copy `.env.example` to `.env.local` and provide your Supabase values when ready.

If no Supabase environment variables are set, the app uses its local demo repository automatically.

## Supabase setup

- Starter schema: `supabase/schema.sql`
- The first local demo account becomes admin, but the real Supabase admin role should be assigned in `profiles.role`
- Browser router support for Vercel is configured in `vercel.json`
- Fill `.env.local` with your Supabase project URL and anon key
- After creating the Supabase project, run the SQL in `supabase/schema.sql` in the Supabase SQL editor
