# Demo scenarios

Fictional patient and volunteer profiles for demonstrations and future DailyBuddy testing. All dates are relative to Amsterdam "today" when you run `npm run demo:seed`.

## Participation need coverage

| Need | Patients |
|------|----------|
| `social` | PAT-02, PAT-05, PAT-06, PAT-08, PAT-10, PAT-12 |
| `movement` | PAT-01, PAT-07, PAT-10, PAT-11 |
| `creative` | PAT-04, PAT-10, PAT-11 |
| `relaxation` | PAT-03, PAT-05, PAT-06 |
| *(none)* | PAT-09 |

## Required archetypes

### PAT-09 Iris — no participation preference

- **Check-in:** `participation_needs: []`, neutral scores
- **Note:** "Geen specifieke wens vandaag."
- **Future AI angle:** should not invent needs; gentle optional contact only

### PAT-07 Mia — conflicting needs vs symptoms

- **Need:** `movement`
- **Symptoms:** pain 6, mobility 1, wheelchair context, high fall risk
- **Future AI angle:** acknowledge wish, defer to clinical limits, suggest safe alternatives

### PAT-10 Fatima — highly social

- **Needs:** `social`, `movement`, `creative`; mood 5
- **Future AI angle:** enthusiastic group participation; match with social/creative volunteers

### PAT-08 Ruben — close to discharge

- **Expected discharge:** tomorrow
- **Need:** `social`; optimistic check-in
- **Future AI angle:** celebrate progress; light social closure, no new commitments

### PAT-12 Lien — prefers individual contact

- **Need:** `social`
- **Note:** quiet morning 1-on-1, not large groups
- **Future AI angle:** route to morning block and empathetic volunteers (Grace), not afternoon group

## Full patient roster

| Ref | Name | Admission | Key context | Today's needs | Demo talking point |
|-----|------|-----------|-------------|---------------|-------------------|
| PAT-01 | Sanne de Vries | Appendectomy | Walker, ward only | social, movement | Recovering well; discharge in ~5 days |
| PAT-02 | Kees Bakker | Pneumonia | Chair only, supervision | social | Lonely; fatigue limits energy |
| PAT-03 | Lotte Jansen | Chemo support | Room only, wheelchair | relaxation | Rest-first; nausea |
| PAT-04 | Noah Vermeer | Hand surgery | Independent walking | creative | Aligns with today's creative plan |
| PAT-05 | Eva Mulder | Burnout | Cognitive support | social, relaxation | Gentle nudge only |
| PAT-06 | Tom Hendriks | Anxiety | Medium fall risk | relaxation, social | Calming, predictable contact |
| PAT-07 | Mia van Dijk | Hip replacement | Wheelchair, high fall risk | movement | **Conflict** need vs pain/mobility |
| PAT-08 | Ruben Smit | Pre-discharge | Independent | social | **Discharge tomorrow** |
| PAT-09 | Iris de Boer | Observation | Walking with aid | *(empty)* | **No preference** |
| PAT-10 | Fatima El Amrani | Social isolation | Independent | social, movement, creative | **Highly social** |
| PAT-11 | Jan Kuipers | Shoulder surgery | Walker | movement, creative | Moderate recovery |
| PAT-12 | Lien Vos | Depression | Cognitive support | social | **Individual morning contact** |

## Volunteer personalities

Each volunteer has a Dutch bio on `/planning/volunteers` and a preferred activity type for future AI matching.

| Volunteer | Personality | Preferred type | Availability highlight |
|-----------|-------------|----------------|------------------------|
| Emma | Warm connector | `social` | Mon/Wed/Fri blocks; Tue morning |
| Finn | Creative enthusiast | `creative` | Tue/Thu/Sat afternoons; records today's plan |
| Grace | Calm listener | `relaxation` | Mon–Fri mornings only |
| Hugo | Practical motivator | `movement` | Sparse Wed PM / Sat AM; absence today on first block |

## Daily participation plans

| Date | Recorder | Category | Title |
|------|----------|----------|-------|
| Today | Finn | `creative` | Samen kleuren en muziek luisteren |
| Tomorrow | Coordinator | `movement` | Rustige ochtendwandeling in de binnentuin |

## Future DailyBuddy branch

These scenarios are manual test oracles for `feature/dailybuddy-participation-advice`. The seed scripts do **not** call `get_morning_contact_availability_signal` or any advice API.
