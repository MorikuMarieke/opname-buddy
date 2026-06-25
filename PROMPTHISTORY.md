Step 0 Initiated project through terminal

Step 1 Used chat gpt to define .cursor/rules files

Prompt 1.1 can you create the folder structure based on the .cursor/rules files?

Prompt 1.2 Review the current route structure for OpnameBuddy and update it to match the finalized MVP domains.

Required route domains:
- auth
- patient dashboard
- care dashboard
- planning module
- admin module

Create placeholder pages only. Do not add real forms, Supabase, authentication, React Query or AI.

Use these routes:
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
app/dashboard/page.tsx
app/dashboard/checkin/page.tsx
app/dashboard/questions/page.tsx
app/dashboard/activities/page.tsx
app/dashboard/advice/page.tsx
app/care/page.tsx
app/care/patients/page.tsx
app/care/patients/[patientId]/page.tsx
app/planning/page.tsx
app/planning/activities/page.tsx
app/planning/sessions/page.tsx
app/planning/volunteers/page.tsx
app/admin/page.tsx
app/admin/users/page.tsx
app/admin/roles/page.tsx

Keep the existing visual style. Use placeholder content only.

Also update the folder structure in project.mdc

Prompt 1.3 caregiver needed to be changed to care, but you created a new route, can you remove the caregiver route. 

Step 2 Worked in browser with chatgpt to create concept for visual style, colors, used coolors.com for color scheme, generated image for visual direction based on colors and style choices. 

Prompt 2.1 Create the visual foundation for OpnameBuddy.

Do not implement business logic, Supabase, authentication, React Query, AI functionality, forms, mock services or database connections.

Only focus on layout, navigation, reusable UI components and styling.

PROJECT CONTEXT

OpnameBuddy is a recovery participation platform for hospitalized patients.

The application contains four domains:

PATIENT
- Complete daily check-ins
- View activities
- Receive DailyBuddy recommendations
- Manage questions for caregivers
- View weekly summaries

CARE
- View patient information
- Manage restrictions and recovery context
- Review check-ins
- Review patient questions

PLANNING
- Manage activities
- Manage activity sessions
- Manage volunteer availability
- Maintain the activity calendar

ADMIN
- Manage users
- Manage roles
- Manage system settings

DESIGN GOALS

The application serves two different user groups.

PATIENT EXPERIENCE

The patient dashboard should feel like a modern tablet kiosk.

Characteristics:
- Large touch-friendly cards
- Clear primary actions
- Simple navigation
- Calm and motivating
- Suitable for patients with limited digital skills
- Focus on participation and recovery

PROFESSIONAL EXPERIENCE

The care, planning and admin modules should feel like professional healthcare dashboards.

Characteristics:
- Optimized for laptop, desktop and hospital workstations
- More information density
- Structured layouts
- Tables, summaries and management views
- Consistent with the patient-facing visual language

RESPONSIVE REQUIREMENTS

All pages must work on:
- Mobile
- Tablet
- Laptop
- Desktop

Patient pages should be tablet-first.

Care, Planning and Admin pages should be desktop-first.

VISUAL STYLE

Use a calm healthcare-inspired design.

Avoid:
- Corporate SaaS styling
- Cold medical interfaces
- Overly playful UI
- Bright rainbow color schemes

Prefer:
- Warm neutral backgrounds
- Card-based layouts
- Clear visual hierarchy
- High readability
- Large touch targets where appropriate

COLOR PALETTE

Use semantic tokens and build the design system around these colors.

Text:
- Carbon Black

Primary Navigation:
- Blue Slate

Supportive Sections:
- Pearl Aqua

Primary Actions and Motivation:
- Copper

Attention States:
- Cherry Rose

Background:
- Parchment

Secondary Surfaces:
- Dust Grey

Do not use Cherry Rose as a success color.

Use Copper for positive actions and engagement.

COMPONENTS

Create reusable components where appropriate:

- DashboardShell
- SidebarNavigation
- TopNavigation
- DashboardCard
- ActionTile
- SectionHeader
- StatusBadge
- PrimaryButton
- SecondaryButton
- EmptyState

ROUTES

Patient:
- Dashboard
- Check-in
- Questions
- Activities
- DailyBuddy Advice

Care:
- Patient Overview
- Patient Detail
- Restrictions
- Recovery Context

Planning:
- Activity Overview
- Activity Sessions
- Volunteer Availability
- Calendar View

Admin:
- Users
- Roles

IMPORTANT

Use Dutch text for all visible placeholder content.

Use English for:
- Component names
- File names
- Folder names
- TypeScript types

Use the attached inspiration imag as visual direction. 

Focus on creating a strong visual foundation before implementing any functionality.
