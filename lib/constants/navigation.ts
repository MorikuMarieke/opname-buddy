import {
  Activity,
  Bell,
  Building2,
  Calendar,
  CalendarDays,
  ClipboardList,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircleQuestion,
  Plus,
  Repeat2,
  Settings,
  Shield,
  Sun,
  User,
  Users,
} from "lucide-react";
import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import type { NavItem } from "@/types/navigation";

export const patientBottomNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Check-in", href: "/dashboard/checkin", icon: ClipboardList },
  { label: "Vragen", href: "/dashboard/questions", icon: MessageCircleQuestion },
  {
    label: PATIENT_CONTEXT_COPY.patient.navLabel,
    href: "/dashboard/context",
    icon: Heart,
  },
  { label: "Vandaag", href: "/dashboard/activities", icon: Calendar },
  { label: "DagBuddy", href: "/dashboard/advice", icon: Sun },
];

export const patientNavItems: NavItem[] = patientBottomNavItems;

export const careNavItems: NavItem[] = [
  { label: "Overzicht", href: "/care", icon: LayoutDashboard },
  { label: "Patiënten", href: "/care/patients", icon: Users },
  { label: "Geplande activiteiten", href: "/care/activities", icon: CalendarDays },
  { label: "Meldingen", href: "/care", icon: Bell, badge: 3 },
  { label: "Instellingen", href: "/care", icon: Settings },
];

export const planningNavItems: NavItem[] = [
  { label: "Planning", href: "/planning", icon: LayoutDashboard },
  { label: "Activiteit plannen", href: "/planning/plan", icon: Plus },
  { label: "Sessies", href: "/planning/sessions", icon: CalendarDays },
  { label: "Reeksen", href: "/planning/series", icon: Repeat2 },
  { label: "Mijn begeleiding", href: "/planning/facilitator", icon: Users },
  { label: "Kalender", href: "/planning/calendar", icon: Calendar },
  { label: "Activiteiten", href: "/planning/activities", icon: Activity },
];

export const volunteerNavItems: NavItem[] = [
  { label: "Geplande activiteiten", href: "/volunteer", icon: CalendarDays },
  { label: "Beschikbaarheid", href: "/volunteer/availability", icon: Repeat2 },
  { label: "Mijn profiel", href: "/volunteer/profile", icon: User },
];

export const adminNavItems: NavItem[] = [
  { label: "Overzicht", href: "/admin", icon: LayoutDashboard },
  { label: "Gebruikers", href: "/admin/users", icon: Users },
  { label: "Rollen", href: "/admin/roles", icon: Shield },
  { label: "Afdelingen", href: "/admin/departments", icon: Building2 },
];

export function getCarePatientSubNavItems(patientId: string): NavItem[] {
  return [
    {
      label: "Overzicht",
      href: `/care/patients/${patientId}`,
      icon: LayoutDashboard,
    },
    {
      label: "Gegevens",
      href: `/care/patients/${patientId}/edit`,
      icon: Users,
    },
    {
      label: PATIENT_CONTEXT_COPY.staff.subNavLabel,
      href: `/care/patients/${patientId}/context`,
      icon: Heart,
    },
  ];
}
