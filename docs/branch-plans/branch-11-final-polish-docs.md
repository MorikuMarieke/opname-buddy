# Branch plan — feature/final-polish-docs

**Branch:** `feature/final-polish-docs`  
**Status:** Planned  
**Depends on:** branches 1–10 (core product slices complete)

---

## Scope

UI polish, accessibility, documentation, deployment safeguards, and final QA before wider rollout.

This document is the branch-11 home. Known technical debt and polish backlog items are tracked here as they are discovered during earlier branches.

---

## Known technical debt

### Temporary proxy env guard

| Field | Detail |
|-------|--------|
| **Title** | Temporary proxy env guard |
| **Introduced** | `7aa574b` (Jul 2026) after Vercel production 500 incident |
| **Symptom** | Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` causes `createServerClient()` to throw in `proxy.ts` → Internal Server Error on every route |
| **Current workaround** | Early return in `lib/supabase/middleware.ts` `updateSession()` when public Supabase env is incomplete — site stays up, but session refresh is skipped |
| **Risk** | Silent auth failure; harder to diagnose than the admin client, which throws `Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY` |
| **Interim mitigation** | Root-layout `ConfigWarningBanner` when public env is missing (see `components/layout/config-warning-banner.tsx`) |
| **Target end state** | Remove silent skip; replace with explicit operator-facing configuration error UX and deployment safeguards |
| **Removal criteria** | Env validation at deploy time plus clear in-app error when misconfigured — no silent auth skip |

**Affected files:**

- [`lib/supabase/middleware.ts`](../../lib/supabase/middleware.ts) — guard and skipped `supabase.auth.getUser()`
- [`proxy.ts`](../../proxy.ts) — invokes `updateSession` on almost every request
- [`lib/config/supabase-env.ts`](../../lib/config/supabase-env.ts) — shared env check helper
- [`components/layout/config-warning-banner.tsx`](../../components/layout/config-warning-banner.tsx) — interim operator warning

**Incident notes (Jul 2026):** Vercel production returned site-wide 500 after Supabase env vars were lost from the deployment environment. Re-importing env vars and redeploying restored service. The proxy guard prevents recurrence of the 500 but must be replaced with a proper configuration failure mode during this branch.

---

## Polish backlog

- [ ] **Proxy env guard removal** — replace silent skip with deploy-time validation and explicit configuration error UX (see debt item above)
- [ ] **Centralize Supabase env checks** — single helper used by proxy, server client, and warning banner (`lib/config/supabase-env.ts` started)
- [ ] **Align failure modes** — loud for operators when misconfigured; never site-wide 500 for static pages
- [ ] **Deployment QA checklist** — verify Vercel Production env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (see [`.env.example`](../../.env.example))
- [ ] Accessibility audit across dashboards (tablet-first, touch targets, contrast)
- [ ] Multi-role navigation polish (staff with multiple roles land on highest-priority route only)
- [ ] Final documentation pass and operator runbooks

---

## Post-ship verification

- Production deploy succeeds with env checklist signed off
- No silent auth skip in proxy (debt item resolved)
- Accessibility spot-check on patient, care, planning, and admin flows
- Deployment runbook updated in project docs
