# Future: UI polish (coordinator & volunteers)

**Status:** Deferred — still valid UX debt for `/planning` and volunteer screens after DailyBuddy shipped
**Target branch:** future polish / UX branch (e.g. branch 11)
**Added:** 2026-07-15
**Trigger:** Tackle after planning + DailyBuddy are stable; do not mix into AI-agent or data-model branches.

Related: planning module routes under `app/planning/`, especially coordinator daily view and volunteer overview.

---

## Scope note

All items in this document are **deferred**. They capture known UX debt so a future polish branch can address them without scope creep in the current AI workstream.

**Do not implement these changes on the current AI branch.**

---

## General UX principle

Use **progressive disclosure**:

1. Show information first (read-first).
2. Show forms only after an explicit create or edit action.
3. Avoid displaying duplicate read and edit representations at the same time.

Screens that today keep forms always open should move toward compact summaries plus intentional edit entry points.

---

## Coordinator daily dashboard

**Context:** The current dashboard is functional but visually dense and unclear. It behaves more like an always-open CRUD form than a scannable coordination overview.

### Deferred improvements

| Status | Item |
|--------|------|
| Deferred | Treat the page as a **read-first dashboard**, not an always-open CRUD form. |
| Deferred | Show the recorded afternoon activity **once** in a compact summary card. |
| Deferred | Open the create/edit form only after clicking **`Middagactiviteit vastleggen`** or **`Activiteit wijzigen`**. |
| Deferred | When no activity exists, show a clear **empty state**. |
| Deferred | Reduce **duplicated information** between the summary and the form. |
| Deferred | Make the main daily information easier to scan: morning volunteer availability; afternoon volunteer availability; patient needs; recorded afternoon activity. |
| Deferred | Consider renaming **`Dagplanning`** to **`Dagoverzicht`** or **`Dagcoördinatie`**, because the page mainly provides coordination insight rather than detailed scheduling. |

### Intended shape (when polished)

```
Dagoverzicht / Dagcoördinatie (read-first, priority order)
├─ 1. Attention items (gaps / missing data)
├─ 2. Today's overview (morning / afternoon availability, patient needs)
├─ 3. Current afternoon activity (compact summary or empty state)
└─ 4. Optional edit actions (form only after CTA)
```

---

## Dashboard hierarchy

**Status:** Deferred — out of scope for the current AI branch

The coordinator dashboard should prioritize **actionable information**.

### Suggested priority

1. **Items requiring attention**
   - Afternoon activity not yet recorded
   - No volunteers available this afternoon
   - No patient needs submitted yet

2. **Today's overview**
   - Morning availability
   - Afternoon availability
   - Patient needs

3. **Current afternoon activity**

4. **Optional edit actions**

### Goal

The overview should answer one question first:

> Who is available today?

Detailed volunteer information should only appear after opening an individual volunteer.

| Status | Item |
|--------|------|
| Deferred | Surface attention items above the fold when data is missing or insufficient. |
| Deferred | Structure the page so “who is available today?” is answered before activity CRUD or volunteer detail. |
| Deferred | Keep volunteer detail (bio, weekly pattern, absences) off the dashboard; open it only from an individual volunteer. |

---

## Volunteer overview

**Context:** The current volunteer overview does not scale well when many volunteers exist. Expanded cards and detail-heavy layouts make daily coordination harder.

### Deferred improvements

| Status | Item |
|--------|------|
| Deferred | Replace expanded volunteer cards with a **compact, filterable list**. |
| Deferred | Provide **search by volunteer name**. |
| Deferred | Allow filtering by: available today; morning availability; afternoon availability; selected date. |
| Deferred | Make each volunteer **row clickable**. |
| Deferred | Move weekly availability, biography, and one-time absences to a **volunteer detail page**. |
| Deferred | Remove or redesign the current **date/month controls** when they do not clearly filter the displayed data. |
| Deferred | Keep the overview focused on **who is effectively available for the selected day**. |

### Intended shape (when polished)

```
Volunteer overview (list-first)
├─ Search (name)
├─ Filters (today / morning / afternoon / date)
├─ Compact rows (click → detail)
└─ Detail page
     ├─ Weekly availability
     ├─ Biography
     └─ One-time absences
```

---

## Out of scope (current AI branch)

This document does **not** authorize:

- Refactors of planning UI layout or form disclosure
- Dashboard hierarchy / attention-first layout changes
- New volunteer detail routes or list/filter UX
- Renaming `Dagplanning` in navigation or copy

Those belong on a dedicated future polish branch after the AI work is complete.
