# Branch plan — feature/patient-admission-management

**Branch:** `feature/patient-admission-management`  
**Status:** Implemented in codebase (apply migrations `00031`–`00034` on remote before deploy)  
**Depends on:** `feature/account-domain-model`, `feature/admin-account-management`

---

## Shipped scope

### Database (migrations)

| File | Purpose |
|------|---------|
| `00031_patients_demographics.sql` | `first_name`, `last_name`, `sex`; drop `full_name` |
| `00032_admissions_expected_discharge.sql` | `expected_discharge_on` (nullable) |
| `00033_list_care_patients_v3.sql` | RPC returns structured demographics + expected discharge |
| `00034_issue_patient_link_code.sql` | Service-role function to issue 6-digit link codes |
| `00035_departments.sql` | `departments` reference table + seed data + admin/caregiver RLS |
| `00036_admissions_department_room.sql` | `department_id`, `room_number`; drop `location` |

### Refinements (post-ship)

- Dutch numeric date display (`dd-MM-yyyy`) via `lib/utils/amsterdam-date.ts`; native `type="date"` inputs kept (ISO internally)
- Admin **Afdelingen** (`/admin/departments`) — create, edit, deactivate/reactivate
- Admission forms: department select + room number; admission card shows both

### Caregiver workflows

- **Patiënt opnemen** (`/care/patients/admit`) — new clinical patient + active admission
- **Nieuwe opname** (`/care/patients/[id]/admit`) — readmission on existing patient
- **Ontslag** — discharge active admission with confirmation dialog
- **Gegevens** (`/care/patients/[id]/edit`) — edit demographics
- Patient overview with admission + link cards
- Duplicate prevention: name-based match search with strong/possible tiers
- Link code generation (show once, 24h TTL) for unlinked patients

### Patient workflows

- `/dashboard/link` — redeem 6-digit code
- Dashboard gate redirects unlinked accounts to link flow
- Empty state when linked but no active admission

### Services / routes

- `lib/services/patients.ts`, `lib/services/patient-linking.ts`
- `lib/auth/care-patient-actions.ts`
- Hooks under `hooks/use-*` for admit, admission, search, link, redeem

---

## Domain rules (unchanged)

- Clinical **patients** are long-lived; **admissions** are stays (one active at a time).
- **Account links** attach to the patient, not the admission.
- Care data uses **active `admission_id`**.
- No BSN / no unique constraint on demographics (workflow-only duplicate prevention).

---

## Post-deploy verification

1. Apply migrations `00031`–`00036` and regenerate `types/database.ts` if needed.
2. Caregiver: Patiënt opnemen → generate link code → patient registers → redeems code → check-in works.
3. Caregiver: Ontslag → Nieuwe opname on same patient (no duplicate `patients` row, no re-link).
