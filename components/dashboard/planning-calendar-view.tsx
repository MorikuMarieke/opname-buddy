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
    <div className="space-y-4">
      <SectionHeader
        title="Kalender"
        description="Weekoverzicht van geplande activiteiten."
        size="compact"
      />

      <DashboardCard density="compact" className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-7 gap-2 border-b border-dust-grey-200 pb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-carbon-black-600"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, index) => {
              const dayEvents = calendarEvents.filter((e) => e.day === index);
              return (
                <div
                  key={index}
                  className="min-h-24 rounded-lg border border-dust-grey-200 bg-parchment-50 p-2"
                >
                  <p className="mb-1.5 text-xs font-medium text-carbon-black-600">
                    {index + 19}
                  </p>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={`${event.title}-${event.time}`}
                        className="rounded-md bg-pearl-aqua-50 px-1.5 py-1 text-xs"
                      >
                        <p className="font-medium text-carbon-black-900">
                          {event.title}
                        </p>
                        <p className="text-carbon-black-600">{event.time}</p>
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
