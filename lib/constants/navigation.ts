import {
  Activity,
  Bell,
  Calendar,
  CalendarDays,
  ClipboardList,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircleQuestion,
  Settings,
  Shield,
  Sun,
  Users,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

export const patientBottomNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Check-in", href: "/dashboard/checkin", icon: ClipboardList },
  { label: "Vragen", href: "/dashboard/questions", icon: MessageCircleQuestion },
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
  { label: "Vrijwilligers", href: "/planning/volunteers", icon: Users },
  { label: "Kalender", href: "/planning/calendar", icon: Calendar },
  { label: "Instellingen", href: "/planning", icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { label: "Overzicht", href: "/admin", icon: LayoutDashboard },
  { label: "Gebruikers", href: "/admin/users", icon: Users },
  { label: "Rollen", href: "/admin/roles", icon: Shield },
  { label: "Instellingen", href: "/admin", icon: Settings },
];

export function getCarePatientSubNavItems(patientId: string): NavItem[] {
  return [
    {
      label: "Overzicht",
      href: `/care/patients/${patientId}`,
      icon: LayoutDashboard,
    },
    {
      label: "Beperkingen",
      href: `/care/patients/${patientId}/restrictions`,
      icon: Shield,
    },
    {
      label: "Herstelcontext",
      href: `/care/patients/${patientId}/recovery-context`,
      icon: Heart,
    },
  ];
}
