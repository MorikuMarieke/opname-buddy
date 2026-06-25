import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";

const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

const calendarEvents = [
  { day: 1, title: "Koffieochtend", time: "09:00" },
  { day: 1, title: "Ochtendgym", time: "10:00" },
  { day: 2, title: "Schilderen", time: "13:30" },
  { day: 3, title: "Tuinwandeling", time: "11:00" },
  { day: 4, title: "Muziek", time: "14:00" },
];

export function PlanningCalendarView() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Kalender"
        description="Weekoverzicht van geplande activiteiten."
      />

      <DashboardCard padding="sm" className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 gap-2 border-b border-dust-grey pb-3">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-carbon-black/60"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, index) => {
              const dayEvents = calendarEvents.filter((e) => e.day === index);
              return (
                <div
                  key={index}
                  className="min-h-28 rounded-xl border border-dust-grey bg-parchment p-2"
                >
                  <p className="mb-2 text-xs font-medium text-carbon-black/60">
                    {index + 19}
                  </p>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={`${event.title}-${event.time}`}
                        className="rounded-lg bg-pearl-aqua/40 px-2 py-1 text-xs"
                      >
                        <p className="font-medium text-carbon-black">{event.title}</p>
                        <p className="text-carbon-black/60">{event.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
