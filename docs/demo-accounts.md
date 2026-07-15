# Demo accounts

Fictional accounts for graduation demonstrations and local PoC testing. All accounts use the `@opnamebuddy.test` domain and are tagged with `app_metadata.demo_account = true`.

## Shared password

| Field | Value |
|-------|-------|
| Password | `Demo123!` |

Use this password for every demo account below at `/login`.

## Staff and volunteers

| Role | Email | Display name |
|------|-------|--------------|
| Admin | `admin.demo@opnamebuddy.test` | Demo Beheerder |
| Activity coordinator | `coordinator.demo@opnamebuddy.test` | Demo Coördinator |
| Caregiver | `caregiver1.demo@opnamebuddy.test` | Demo Zorgverlener Anna |
| Caregiver | `caregiver2.demo@opnamebuddy.test` | Demo Zorgverlener Bram |
| Volunteer | `volunteer1.demo@opnamebuddy.test` | Demo Vrijwilliger Emma |
| Volunteer | `volunteer2.demo@opnamebuddy.test` | Demo Vrijwilliger Finn |
| Volunteer | `volunteer3.demo@opnamebuddy.test` | Demo Vrijwilliger Grace |
| Volunteer | `volunteer4.demo@opnamebuddy.test` | Demo Vrijwilliger Hugo |

## Patient accounts

Each patient account links to a clinical record `DEMO-PAT-01` … `DEMO-PAT-12`.

| Ref | Email | Fictional name |
|-----|-------|----------------|
| DEMO-PAT-01 | `patient1.demo@opnamebuddy.test` | Sanne de Vries |
| DEMO-PAT-02 | `patient2.demo@opnamebuddy.test` | Kees Bakker |
| DEMO-PAT-03 | `patient3.demo@opnamebuddy.test` | Lotte Jansen |
| DEMO-PAT-04 | `patient4.demo@opnamebuddy.test` | Noah Vermeer |
| DEMO-PAT-05 | `patient5.demo@opnamebuddy.test` | Eva Mulder |
| DEMO-PAT-06 | `patient6.demo@opnamebuddy.test` | Tom Hendriks |
| DEMO-PAT-07 | `patient7.demo@opnamebuddy.test` | Mia van Dijk |
| DEMO-PAT-08 | `patient8.demo@opnamebuddy.test` | Ruben Smit |
| DEMO-PAT-09 | `patient9.demo@opnamebuddy.test` | Iris de Boer |
| DEMO-PAT-10 | `patient10.demo@opnamebuddy.test` | Fatima El Amrani |
| DEMO-PAT-11 | `patient11.demo@opnamebuddy.test` | Jan Kuipers |
| DEMO-PAT-12 | `patient12.demo@opnamebuddy.test` | Lien Vos |

## Landing routes after login

| Role | Default route |
|------|---------------|
| Admin | `/admin` |
| Activity coordinator | `/planning` |
| Caregiver | `/care` |
| Volunteer | `/volunteer` |
| Patient | `/dashboard` |

## Safety

- Demo accounts never replace your existing development accounts.
- Cleanup only removes users with `@opnamebuddy.test` emails **and** `demo_account` metadata, plus patients whose `external_ref` starts with `DEMO-PAT-`.

See [demo-data.md](./demo-data.md) for seed and cleanup commands.
