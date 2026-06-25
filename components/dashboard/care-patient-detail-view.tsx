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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <SectionHeader title={patientName} description={`Kamer ${room}`} />
        <div className="flex gap-2">
          <StatusBadge variant="positive">Check-in voltooid</StatusBadge>
          <StatusBadge variant="attention">2 open vragen</StatusBadge>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-2 border-b border-dust-grey pb-4"
        aria-label="Patiënt subnavigatie"
      >
        {subNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-slate text-white"
                  : "bg-dust-grey/50 text-carbon-black hover:bg-dust-grey",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <SectionHeader title={content.title} description={content.description} />

      <DashboardCard>
        <p className="text-carbon-black/70">{content.body}</p>
      </DashboardCard>
    </div>
  );
}
