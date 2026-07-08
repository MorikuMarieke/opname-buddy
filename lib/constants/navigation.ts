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
  Repeat2,
  Settings,
  Shield,
  Sun,
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
  { label: "Activiteiten", href: "/dashboard/activities", icon: Calendar },
  { label: "DagBuddy", href: "/dashboard/advice", icon: Sun },
];

export const patientNavItems: NavItem[] = patientBottomNavItems;

export const careNavItems: NavItem[] = [
  { label: "Overzicht", href: "/care", icon: LayoutDashboard },
  { label: "Patiënten", href: "/care/patients", icon: Users },
  { label: "Meldingen", href: "/care", icon: Bell, badge: 3 },
  { label: "Instellingen", href: "/care", icon: Settings },
];

export const planningNavItems: NavItem[] = [
  { label: "Planning", href: "/planning", icon: LayoutDashboard },
  { label: "Activiteiten", href: "/planning/activities", icon: Activity },
  { label: "Sessies", href: "/planning/sessions", icon: CalendarDays },
  { label: "Terugkerend", href: "/planning/recurring", icon: Repeat2 },
  { label: "Vrijwilligers", href: "/planning/volunteers", icon: Users },
  { label: "Kalender", href: "/planning/calendar", icon: Calendar },
  { label: "Instellingen", href: "/planning", icon: Settings },
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
