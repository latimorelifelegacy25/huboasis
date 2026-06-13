# Latimore Life & Legacy — Virtual Interactive Intake

Branded multi-step intake experience for Latimore Life & Legacy LLC
("Protecting Today. Securing Tomorrow."). Built with Next.js (App Router),
Supabase (Postgres + Auth), Resend, and Google Chat webhooks, per
SPEC-1-Latimore-Life-Legacy-Virtual-Interactive-Intake.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project settings.
   - `SUPABASE_SERVICE_ROLE_KEY` — used server-side only for writing intake data and reading advisor summaries.
   - `RESEND_API_KEY` / `ADVISOR_ALERT_FROM_EMAIL` — for the email alert sent to `ADVISOR_ALERT_EMAIL`.
   - `GOOGLE_CHAT_WEBHOOK_URL` — incoming webhook for the advisor's Google Chat space. Treat this as a secret and rotate it before production.
   - `BOOK_WITH_JACKSON_URL` — Google Calendar booking link used by the final CTA.

3. Apply the database schema in `supabase/migrations/0001_init.sql` to your Supabase project (via the SQL editor or `supabase db push`).

4. Create an admin user in Supabase Auth for Jackson to access `/admin/leads`.

5. Run the dev server:

   ```bash
   npm run dev
   ```

## Routes

- `/` — landing page
- `/intake` — multi-step intake (journey, contact, F.O.R.M., PFR/DIME questions, priorities)
- `/intake/results/[leadId]` — client-facing Protection & Legacy Score and recommended review topics
- `/book-with-jackson/[leadId]` — tracks the booking click, then redirects to the Google Calendar link
- `/admin/login` — advisor sign-in
- `/admin/leads` — lead list with scores and urgency
- `/admin/leads/[leadId]` — full advisor summary (F.O.R.M., financials, DIME gap, priorities)

## Compliance

The intake is educational and appointment-preparation only. It avoids
qualification, recommendation, or guarantee language; results are framed as
"topics to review with Jackson." See `src/components/Disclaimer.tsx`.
