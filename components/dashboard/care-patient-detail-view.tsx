"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { getCarePatientSubNavItems } from "@/lib/constants/navigation";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";

interface CarePatientDetailViewProps {
  patientId: string;
  patientName: string;
  room: string;
  variant: "overview" | "restrictions" | "recovery-context";
}

const variantContent: Record<
  CarePatientDetailViewProps["variant"],
  { title: string; description: string; body: string }
> = {
  overview: {
    title: "Patiëntoverzicht",
    description: "Samenvatting van herstel en participatie.",
    body: "Hier komt het patiëntoverzicht met recente check-ins, open vragen en activiteiten.",
  },
  restrictions: {
    title: "Beperkingen",
    description: "Actieve beperkingen en aandachtspunten.",
    body: "Hier worden mobiliteit, dieet en andere beperkingen beheerd door het zorgteam.",
  },
  "recovery-context": {
    title: "Herstelcontext",
    description: "Achtergrond en doelen voor herstel.",
    body: "Hier staat de herstelcontext zoals vastgelegd door het zorgteam.",
  },
};

export function CarePatientDetailView({
  patientId,
  patientName,
  room,
  variant,
}: CarePatientDetailViewProps) {
  const pathname = usePathname();
  const subNavItems = getCarePatientSubNavItems(patientId);
  const content = variantContent[variant];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title={patientName}
          description={`Kamer ${room}`}
          size="compact"
        />
        <div className="flex gap-2">
          <StatusBadge variant="positive">Check-in voltooid</StatusBadge>
          <StatusBadge variant="attention">2 open vragen</StatusBadge>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-2 border-b border-dust-grey-200 pb-3"
        aria-label="Patiënt subnavigatie"
      >
        {subNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-slate-800 text-white"
                  : "bg-dust-grey-100 text-carbon-black-900 hover:bg-dust-grey-200",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <SectionHeader
        title={content.title}
        description={content.description}
        size="compact"
      />

      <DashboardCard density="compact">
        <p className="text-sm text-carbon-black-600">{content.body}</p>
      </DashboardCard>
    </div>
  );
}
