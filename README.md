# OpnameBuddy

OpnameBuddy is a tablet-first recovery participation platform for people who are admitted to hospital. It supports patients in taking an active role in their day, while keeping healthcare-professional safety boundaries leading.

> OpnameBuddy supports reflection, communication, and safe participation. It does not provide medical diagnosis, treatment, or clinical decision-making.

## Core functionality

1. **Daily patient check-ins** — patients complete a short daily check-in about how they feel, their energy, and what they need to participate that day.
2. **Care context and patient questions** — caregivers record relevant participation restrictions and considerations, review patient check-ins, and manage questions submitted by patients.
3. **Activity and volunteer coordination** — activity coordinators define what the available activities involve. Volunteers provide their availability and record the afternoon activity. Patients do not browse a separate activity overview; they receive relevant participation context through DailyBuddy.
4. **DailyBuddy participation advice** — DailyBuddy combines the patient’s check-in with their care context and the available participation options to create personalised daily advice. Deterministic safety rules keep the advice within the recorded care boundaries; it does not provide medical advice.

## Stack

- Next.js 16 (App Router), React 19, and TypeScript
- Tailwind CSS
- Supabase: Auth, PostgreSQL, Row Level Security (RLS), and RPCs
- TanStack React Query for client-side data fetching and mutations
- Vercel AI SDK and OpenAI for DailyBuddy
- Zod for validation
- Vercel for deployment

## Project links

- GitHub: [MorikuMarieke/opname-buddy] https://github.com/MorikuMarieke/opname-buddy
- Vercel production: https://opname-buddy.vercel.app
- Supabase base URL: https://ioqcxvhuomyfzaodaiqf.supabase.co

## Requirements

- Node.js 20.9 or newer (Node.js 20 LTS recommended)
- npm 10 or newer
- A Supabase project with the migrations in this repository applied
- An OpenAI API key for DailyBuddy generation

## Run locally

```bash
git clone https://github.com/MorikuMarieke/opname-buddy.git
cd opname-buddy
npm install
cp .env.example .env.local
npm run dev
```

Fill in the values in `.env.local`, then open [http://localhost:3000](http://localhost:3000).
