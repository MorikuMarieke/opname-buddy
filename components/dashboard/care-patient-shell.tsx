"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SectionHeader } from "@/components/ui/section-header";
import { useCarePatients } from "@/hooks/use-care-patients";
import { getCarePatientSubNavItems } from "@/lib/constants/navigation";
import { formatPatientDisplayName } from "@/lib/utils/patient-greeting";
import { cn } from "@/lib/utils/cn";

interface CarePatientShellProps {
  patientId: string;
  children: React.ReactNode;
}

export function CarePatientShell({ patientId, children }: CarePatientShellProps) {
  const pathname = usePathname();
  const { data: patients } = useCarePatients();
  const patient = patients?.find((item) => item.id === patientId);
  const patientName = patient ? formatPatientDisplayName(patient) : "Patiënt";
  const subNavItems = getCarePatientSubNavItems(patientId);

  return (
    <div className="space-y-4">
      <SectionHeader
        title={patientName}
        description="Patiëntgegevens"
        size="compact"
      />

      <nav
        className="flex flex-wrap gap-2 border-b border-parchment-200 pb-3"
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
                  ? "bg-blue-slate-700 text-white"
                  : "bg-parchment-100 text-carbon-black-900 hover:bg-parchment-200",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
