# Demo walkthrough

A **15–20 minute** graduation demonstration of the daily participation proof of concept using only `@opnamebuddy.test` accounts.

## Before you start

1. Ensure `.env.local` has Supabase URL and `SUPABASE_SERVICE_ROLE_KEY`.
2. Run `npm run demo:seed`.
3. Open [demo-accounts.md](./demo-accounts.md) for logins. Password for all accounts: `Demo123!`.
4. Start the app: `npm run dev`.

---

## 1. Setup (1 min)

Explain that the dataset is fictional, idempotent, and safe to tear down:

```bash
npm run demo:seed
```

Mention 20 accounts, 12 patients, 4 volunteers, Amsterdam-relative dates.

---

## 2. Coordinator — planning overview (4 min)

**Login:** `coordinator.demo@opnamebuddy.test`

**Route:** `/planning`

**Show:**

- Date picker defaulting to today (Amsterdam)
- Morning block (10:00–12:00) and afternoon block (14:00–16:00)
- Aggregated participation needs from 12 check-ins — all four categories visible
- Volunteer effective availability for today (varied because of weekly patterns and absences)
- Today's afternoon plan: *Samen kleuren en muziek luisteren* (creative), recorded by Finn
- Tomorrow's plan preview: movement walk (coordinator-recorded)

**Talking points:**

- Ward-wide afternoon communication: one plan per calendar date
- Morning block is individual contact between volunteer and patient
- Needs come from today's patient check-ins, not invented by the app

---

## 3. Coordinator — volunteer roster (3 min)

**Route:** `/planning/volunteers`

**Show:**

- Four volunteers with distinct Dutch bios
- Weekly availability grids
- Known absences (e.g. Emma away tomorrow afternoon; Hugo absent today on first available block)

**Talking points:**

- Volunteers self-manage availability; coordinators see effective availability
- Personalities and preferred activity types prepare for future AI matching (not active in this branch)

---

## 4. Volunteer — afternoon context (2 min)

**Login:** `volunteer2.demo@opnamebuddy.test` (Finn)

**Route:** `/volunteer`

**Show:**

- Needs summary for today
- Context that Finn recorded today's creative afternoon plan

**Talking points:**

- Volunteers see participation needs, not clinical diagnosis
- Afternoon recording is volunteer-facing in this PoC

---

## 5. Volunteer — availability (2 min)

**Login:** `volunteer3.demo@opnamebuddy.test` (Grace)

**Route:** `/volunteer/availability`

**Show:**

- Mon–Fri morning-only pattern
- Confirmation copy on save

**Talking points:**

- Fixed blocks simplify scheduling vs legacy activity planning
- Grace suits patients who want quiet morning contact (e.g. Lien)

---

## 6. Patient highlights (4 min)

Log out between patients. Password remains `Demo123!`.

| Patient | Email | Routes | What to show |
|---------|-------|--------|--------------|
| Fatima (PAT-10) | `patient10.demo@opnamebuddy.test` | `/dashboard/checkin`, `/dashboard/activities` | Enthusiastic social + creative needs; afternoon message |
| Mia (PAT-07) | `patient7.demo@opnamebuddy.test` | `/dashboard/checkin` | Movement need vs pain/mobility conflict |
| Lien (PAT-12) | `patient12.demo@opnamebuddy.test` | `/dashboard/checkin` | Individual morning preference in note |
| Iris (PAT-09) | `patient9.demo@opnamebuddy.test` | `/dashboard/checkin` | Empty `participation_needs` — no preference |

**Talking points:**

- Patients express participation wishes, not treatment decisions
- Activities view is read-only for patients
- Empty needs are valid — important for future DailyBuddy guardrails

---

## 7. Caregiver — patient list (2 min)

**Login:** `caregiver1.demo@opnamebuddy.test`

**Route:** `/care/patients`

**Show:**

- 12 demo patients across departments
- Active admissions and varied context

**Talking points:**

- Care dashboard unchanged in scope; participation is additive
- Clinical context informs what participation is realistic

---

## 8. DailyBuddy placeholder (1 min)

**Login:** any patient account

**Route:** `/dashboard/advice`

**Show:** coming-soon placeholder.

**Talking points:**

- DailyBuddy advice ships on a separate branch
- Demo data already encodes scenarios for that branch (see [demo-scenarios.md](./demo-scenarios.md))

---

## 9. Teardown (1 min)

Preview cleanup scope without deleting during the demo:

```bash
npm run demo:cleanup -- --dry-run
```

After the presentation, remove demo data before returning to dev accounts:

```bash
npm run demo:cleanup
```

---

## Optional extensions

- **Admin** (`admin.demo@opnamebuddy.test`) → `/admin/users` to show demo accounts in user management
- **Second caregiver** (`caregiver2.demo@opnamebuddy.test`) → `/care/patients` for role parity
- **Ruben (PAT-08)** → highlight expected discharge tomorrow on care patient detail

## Related docs

- [demo-accounts.md](./demo-accounts.md)
- [demo-data.md](./demo-data.md)
- [demo-scenarios.md](./demo-scenarios.md)
