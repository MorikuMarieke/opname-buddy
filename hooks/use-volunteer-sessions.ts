"use client";

import { useQuery } from "@tanstack/react-query";

import { listVolunteerSessions } from "@/lib/services/volunteer-sessions";
import { queryKeys } from "@/lib/constants/query-keys";

export function useVolunteerSessions() {
  return useQuery({
    queryKey: queryKeys.volunteer.sessions.all,
    queryFn: () => listVolunteerSessions(),
  });
}
