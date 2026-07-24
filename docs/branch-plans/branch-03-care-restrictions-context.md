# Branch 3: Zorgcontext (patient_context)

**Branch:** `feature/care-restrictions-context`
**Status:** Implemented (zorgcontext UI + policies). Caregiver SELECT on check-ins and UPDATE on question `status` / `answer_notes` exist in RLS (`00010`); **care UI for those flows was not delivered** and remains deferred.
**Depends on:** `feature/patient-checkins-questions` (branch 2)

Caregiver-maintained practical care facts for safe participation. Planning decisions (volunteer suitability, intensity, duration) are **not** stored — DagBuddy derives suggestions within these boundaries.

---

## Delivered

### Database

- `00008_patient_context.sql` — `patient_context` table, `has_role()`, RLS, caregiver patient list on `profiles`
- `00009_patient_context_grants.sql` — API grants
- `00010_caregiver_patient_data_policies.sql` — caregiver SELECT on check-ins, evaluations; caregiver UPDATE on question `status` / `answer_notes`
- `00012_patient_context_ux_refine.sql` — field simplification, expanded attention chips, enum reshaping

### Application

| Layer | Path |
|-------|------|
| Types | `types/patient-context.ts`, `types/database.ts` |
| Completeness | `lib/patient-context/completeness.ts`, `lib/patient-context/mobility-aid.ts` |
| Copy | `lib/constants/patient-context-copy.ts` |
| Validation | `lib/validations/patient-context.ts` |
| Service | `lib/services/patient-context.ts` |
| Hooks | `hooks/use-patient-context.ts`, `hooks/use-care-patients.ts` |
| Staff UI | `/care/patients/[patientId]/context` |
| Patient UI | `/dashboard/context` (read-only) |

### UX

- Staff title: **Zorgcontext**; patient title: **Jouw zorgcontext**
- **Clinical worksheet UI** — single compact card, 2-column kern grid (`md:grid-cols-2`), micro section labels (Kern / Optioneel)
- Compact field primitives (`ContextFormField`, `ContextFormSelect`) — `h-9` selects, ring-only incomplete cues
- Attention-point chips for situational detail (incl. infuus/pomp, zuurstof, dwaalrisico, taalbarrière)
- Binary completeness: **Compleet** / **Onvoldoende context** (critical fields only)
- Slim page chrome: compact header, inline audit one-liner, inline missing-fields banner
- Audit metadata: `updated_at` / `updated_by` — caregiver **display name parked** until branch 5 (see below)

### UX refinement (field simplification)

| Change | Detail |
|--------|--------|
| Removed | Belastbaarheid (`weight_bearing_status`) |
| Chips replace enums | IV-lijn / Zuurstof → `iv_pump`, `oxygen` attention chips |
| Begeleiding | `unknown` / `not_required` / `required` |
| Bewegingsvrijheid | `unknown` / `room_only` / `ward_only` / `no_restriction` |
| Completeness | Critical structured fields only; chips and notes never block |

---

## Resolved in branch 5 (`feature/admin-account-management`)

Staff identity and role provisioning shipped in branch 5. See [`docs/branch-plans/branch-05-admin-account-management.md`](../branch-plans/branch-05-admin-account-management.md).

| Topic | Shipped behaviour |
|-------|-------------------|
| Role assignment | Admin UI + server-side assignment flow |
| Staff `full_name` | Employee accounts with display name |
| Zorgcontext “Bijgewerkt door” | Resolves `updated_by_staff_id` → `profiles.full_name` |
| Caregiver reads staff profiles | `00028_profiles_staff_select_and_patient_role.sql` |

---

## Design principles

1. **Facts, not decisions** — no stored volunteer/intensity/duration limits
2. **`unknown` is intentional** — never treated as “no” or safe default
3. **Conditional mobility aid** — fields shown only for `walking_with_aid` / `wheelchair`
4. **Critical completeness** — 6 base fields + conditional `mobility_aid_available`; binary badge (no partly-complete tier)

---

## Routes changed

| Removed | Added |
|---------|-------|
| `/care/patients/[id]/restrictions` | `/care/patients/[id]/context` |
| `/care/patients/[id]/recovery-context` | `/dashboard/context` |

Patient list uses real UUIDs from `profiles` + `user_roles`.

---

## Related docs

- [`docs/domain-model.md`](../domain-model.md) — `patient_context` entity
- [`docs/project-context.md`](../project-context.md) — branch roadmap
- [`docs/branch-plans/branch-05-admin-account-management.md`](../branch-plans/branch-05-admin-account-management.md) — staff profiles and role assignment (shipped)
