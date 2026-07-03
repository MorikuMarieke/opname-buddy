# Future: Admin, staff accounts, and role assignment

**Status:** Parked — not implemented in UI  
**Target branch:** `feature/admin-users-roles` (branch 5)  
**Added:** 2026-07-01  
**Trigger:** Implement `/admin/users`, `/admin/roles`, or any feature that needs reliable staff identity (names in audit trails, caregiver lists, coordinator access).

Related: [`docs/project-context.md`](project-context.md) (roles and redirect rules), [`docs/domain-model.md`](domain-model.md) (`profiles`, `roles`, `user_roles`), [`docs/branch-plans/branch-03-care-restrictions-context.md`](branch-plans/branch-03-care-restrictions-context.md) (Zorgcontext audit metadata).

---

## Current behaviour (as built)

### Auth and profiles

| Step | What happens |
|------|----------------|
| Sign-up | `auth.signUp` with `full_name` in user metadata → `handle_new_user()` creates `profiles` row |
| Login redirect | `/auth/redirect` loads roles via **service role**, picks primary role, sends user to module home |
| No roles | User lands on `/unauthorized` |

**There is no automatic role assignment on registration.** Every test or demo account needs a manual `user_roles` insert until branch 5.

### Role assignment today (manual only)

```sql
-- Example: assign caregiver role to an existing auth user
insert into public.user_roles (user_id, role_id)
select
  '<user-uuid>'::uuid,
  r.id
from public.roles r
where r.name = 'caregiver'
on conflict do nothing;
```

Repeat with `patient`, `activity_coordinator`, or `admin` as needed. Staff may hold **multiple** roles; login redirect uses priority: `admin` > `activity_coordinator` > `caregiver` > `patient`.

### RLS constraints

| Table | Client access |
|-------|----------------|
| `profiles` | Users read/update **own** row; caregivers can read **patient** profiles (`profiles_select_caregiver_patients`, branch 3) |
| `user_roles` | Users read **own** assignments only; no client INSERT/UPDATE/DELETE |
| `roles` | Read-only catalog for all authenticated users |

Role changes and staff profile management are intentionally **server-side / admin-only** to prevent privilege escalation.

### Downstream impact: Zorgcontext audit metadata

Branch 3 stores `patient_context.updated_by` (caregiver UUID) and shows audit fields in the staff Zorgcontext UI.

| Field | Current UI |
|-------|------------|
| Last updated | `updated_at` — works |
| Updated by | Falls back to **“Zorgverlener”** when the caregiver’s `profiles.full_name` cannot be resolved |

**Why the name is missing today**

1. **No staff profile workflow** — test caregivers may exist without a meaningful `full_name`.
2. **RLS** — before branch 5, caregivers could not read other staff `profiles` (only own + patients). Migration `00011_profiles_select_staff_for_caregivers.sql` is prepared to allow reading staff names for audit display; apply when staff accounts are real.
3. **Application wiring** — `getPatientContext` already joins `profiles` for `updated_by` and passes `updatedByName` to `PatientContextAuditMeta`; the UI will show the real name once profiles and RLS are in place.

**Accepted for branch 3:** generic “Zorgverlener” fallback until branch 5.

---

## Intended product flow (branch 5)

### Account types

| Account type | Default role(s) | Created by | Notes |
|--------------|-----------------|------------|-------|
| Patient | `patient` | Self-registration (or admin invite later) | Matches current `/register` path |
| Caregiver | `caregiver` | Admin | Hospital staff; `full_name` required for audit |
| Activity coordinator | `activity_coordinator` | Admin | May also hold `caregiver` |
| Admin | `admin` | Existing admin | User + role management |

Exact invite vs self-register rules are TBD in the branch 5 plan; the invariant is: **every authenticated user must have at least one role before leaving onboarding**.

### Role assignment flow (to design in branch 5)

```
New auth.users row
    │
    ├─ Trigger: profiles row (existing handle_new_user)
    │
    └─ Role assignment (NEW — not built yet)
           │
           ├─ Patient self-register → assign patient (server action or DB trigger)
           ├─ Admin creates staff account → assign caregiver / coordinator / admin
           └─ Admin edits roles → user_roles CRUD via service role + audit log
```

**Open design questions for branch 5**

- Should patients auto-receive `patient` on first login, or only after admin approval?
- Staff accounts: invite email, admin-created password reset, or SSO (out of MVP)?
- Can users change `full_name` themselves, or only admins for staff?
- Multi-role UI: expose all modules in nav when user has e.g. `admin` + `caregiver` (see `project-context.md`).

### Admin module (planned routes)

| Route | Purpose |
|-------|---------|
| `/admin/users` | List users, edit `full_name`, assign/revoke roles |
| `/admin/roles` | View role catalog (likely read-only; names seeded in migrations) |

Implementation will use **service role** or secured server actions — never client-side `user_roles` writes with the anon/authenticated key.

---

## Prepared work (not required for branch 3 sign-off)

| Item | Location | When to enable |
|------|----------|----------------|
| Staff profile SELECT for caregivers | `supabase/migrations/00011_profiles_select_staff_for_caregivers.sql` | Apply with branch 5 or when staff profiles exist |
| Updater name join | `lib/services/patient-context.ts` | Already in code; needs migration + `full_name` data |
| Audit UI prop | `components/dashboard/patient-context-view.tsx` → `PatientContextAuditMeta` | Already wired |

---

## Interim checklist (development / QA)

Until branch 5 ships:

1. After creating accounts, run manual `user_roles` SQL (see above).
2. Set `profiles.full_name` for caregiver test accounts if you want to verify audit names after applying `00011`.
3. Expect Zorgcontext **“Bijgewerkt door”** to show “Zorgverlener” otherwise — not a branch 3 defect.
4. Patients without roles will hit `/unauthorized` after login.

---

## Related docs

| Document | Purpose |
|----------|---------|
| [`docs/project-context.md`](project-context.md) | Role rules and branch roadmap |
| [`docs/domain-model.md`](domain-model.md) | `profiles`, `roles`, `user_roles` blueprint |
| [`docs/branch-plans/branch-03-care-restrictions-context.md`](branch-plans/branch-03-care-restrictions-context.md) | Zorgcontext scope and parked audit name |
