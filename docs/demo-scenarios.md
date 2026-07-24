# Demo scenarios

Fictional patient and volunteer profiles for demonstrations and DailyBuddy testing. All dates are relative to Amsterdam "today" when you run `npm run demo:seed`.

**Teacher / grader:** operate the app with [`functioneel-testdraaiboek.md`](./functioneel-testdraaiboek.md). This file explains *which patient shows which story*.

## Playbook mapping (after seed)

| Playbook | Best demo patient | Why |
|----------|-------------------|-----|
| P1 | PAT-10 Fatima | Access `yes`, social/creative needs; good for full DailyBuddy + interest (after clearing today’s afternoon title — see testdraaiboek §3.4) |
| P3 | PAT-06 Tom (also PAT-09 Iris, PAT-12 Lien) | `can_independently_reach_activity_room = unknown` → advice gate |
| P4 | PAT-02 Kees or PAT-07 Mia | Access `no` → no afternoon group recommendation |
| Morning visit story | PAT-12 Lien | Prefers individual morning contact |
| Empty needs | PAT-09 Iris | `participation_needs: []` still valid |

## Participation need coverage

| Need | Patients |
|------|----------|
| `social` | PAT-02, PAT-05, PAT-06, PAT-08, PAT-10, PAT-12 |
| `movement` | PAT-01, PAT-07, PAT-10, PAT-11 |
| `creative` | PAT-04, PAT-10, PAT-11 |
| `relaxation` | PAT-03, PAT-05, PAT-06 |
| *(none)* | PAT-09 |

## Highlighted archetypes

### PAT-09 Iris — no participation preference

- **Check-in:** `participation_needs: []`, neutral scores
- **Note:** "Geen specifieke wens vandaag."
- **DailyBuddy:** must not invent needs; gentle optional contact only

### PAT-07 Mia — conflicting needs vs symptoms

- **Need:** `movement`
- **Symptoms:** pain 6, mobility 1, wheelchair context, high fall risk
- **DailyBuddy:** acknowledge wish, stay within care limits; no afternoon group (access `no`)

### PAT-10 Fatima — highly social

- **Needs:** `social`, `movement`, `creative`; mood 5
- **DailyBuddy:** strong candidate for afternoon group when access and plan allow

### PAT-08 Ruben — close to discharge

- **Expected discharge:** tomorrow
- **Need:** `social`; optimistic check-in
- **DailyBuddy:** light social closure, no heavy new commitments

### PAT-12 Lien — prefers individual contact

- **Need:** `social`
- **Note:** quiet morning 1-on-1, not large groups
- **DailyBuddy:** morning path when offered; access `unknown` blocks afternoon group

## Full patient roster

| Ref | Name | Admission | Key context | Today's needs | Demo talking point |
|-----|------|-----------|-------------|---------------|-------------------|
| PAT-01 | Sanne de Vries | Appendectomy | Walker, ward only | social, movement | Recovering well; discharge in ~5 days |
| PAT-02 | Kees Bakker | Pneumonia | Chair only, supervision | social | Lonely; fatigue limits energy (**P4**) |
| PAT-03 | Lotte Jansen | Chemo support | Room only, wheelchair | relaxation | Rest-first; nausea |
| PAT-04 | Noah Vermeer | Hand surgery | Independent walking | creative | Aligns with today's creative plan |
| PAT-05 | Eva Mulder | Burnout | Cognitive support | social, relaxation | Gentle nudge only |
| PAT-06 | Tom Hendriks | Anxiety | Medium fall risk | relaxation, social | Calming contact (**P3** unknown access) |
| PAT-07 | Mia van Dijk | Hip replacement | Wheelchair, high fall risk | movement | **Conflict** need vs pain/mobility (**P4**) |
| PAT-08 | Ruben Smit | Pre-discharge | Independent | social | **Discharge tomorrow** |
| PAT-09 | Iris de Boer | Observation | Walking with aid | *(empty)* | **No preference** (**P3**) |
| PAT-10 | Fatima El Amrani | Social isolation | Independent | social, movement, creative | **Highly social** (**P1**) |
| PAT-11 | Jan Kuipers | Shoulder surgery | Walker | movement, creative | Moderate recovery |
| PAT-12 | Lien Vos | Depression | Cognitive support | social | **Individual morning contact** (**P3**) |

## Volunteer personalities

Each volunteer has a Dutch bio on `/planning/volunteers`.

| Volunteer | Personality | Preferred type | Availability highlight |
|-----------|-------------|----------------|------------------------|
| Emma | Warm connector | `social` | Mon/Wed/Fri blocks; Tue morning |
| Finn | Creative enthusiast | `creative` | Tue/Thu/Sat afternoons; records today's plan |
| Grace | Calm listener | `relaxation` | Mon–Fri mornings only |
| Hugo | Practical motivator | `movement` | Sparse Wed PM / Sat AM; absence today on first block |

## Daily participation plans (after seed)

| Date | Recorder | Category | Title |
|------|----------|----------|-------|
| Today | Finn | `creative` | Samen kleuren en muziek luisteren |
| Tomorrow | Coordinator | `movement` | Rustige ochtendwandeling in de binnentuin |

For playbook steps that need **no afternoon title** (interest CTA), clear or change today’s title first — see testdraaiboek §3.4.

## DailyBuddy evaluation matrix

Assume seeded today plan = **creative** (“Samen kleuren…”) unless you cleared the title; morning signal **true** when demo volunteers are seeded. Access = `can_independently_reach_activity_room`.

| Ref | Access | Expected primary | Acceptable alt | Prohibited | Afternoon |
|-----|--------|------------------|----------------|------------|-----------|
| PAT-01 Sanne | yes | morning or afternoon | rest + secondary morning | false need match | may recommend |
| PAT-02 Kees | no | morning | rest + secondary morning | afternoon | never |
| PAT-03 Lotte | no | rest | secondary quiet morning | afternoon pressure | never |
| PAT-04 Noah | yes | afternoon | morning | invent activity title | yes (exact creative match) |
| PAT-05 Eva | yes | rest or morning | rest + secondary | group pressure | prefer not primary |
| PAT-06 Tom | unknown | morning | rest + secondary | loud group | never (unknown) |
| PAT-07 Mia | no | rest or morning quiet | rest + secondary | honor movement as access override | never |
| PAT-08 Ruben | yes | morning social | light afternoon / rest + secondary | heavy commitments | optional |
| PAT-09 Iris | unknown | rest or gentle morning | rest + secondary | invent needs / claim match | never |
| PAT-10 Fatima | yes | afternoon | morning / rest + secondary | invent need matches | yes |
| PAT-11 Jan | yes | morning or afternoon | rest + secondary | ignore access field | may recommend |
| PAT-12 Lien | unknown | morning | rest + secondary | afternoon as primary | never (unknown) |

Wording must include patient-autonomy phrases. Updating check-in regenerates advice; page refresh of ready advice does not start a new model run. AI failure must not block check-in save.

## DailyBuddy automation note

Seed scripts set care-context access flags but do **not** call the advice API. Manual generation happens after patient check-in via `/dashboard/advice`.
