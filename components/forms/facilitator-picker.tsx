"use client";

import { useState } from "react";

import { usePlanningFacilitatorCandidates } from "@/hooks/use-planning-facilitators";
import { ROLE_LABELS } from "@/lib/constants/admin-account-copy";
import { PLANNING_COPY } from "@/lib/constants/planning-copy";
import type { PlanningFacilitatorCandidate } from "@/types/activity";

const copy = PLANNING_COPY.sessions;

function formatRoleLabels(roleNames: string[]): string {
  return roleNames
    .map((role) => ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role)
    .join(", ");
}

interface FacilitatorPickerProps {
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  disabled?: boolean;
}

export function FacilitatorPicker({
  selectedUserIds,
  onChange,
  disabled = false,
}: FacilitatorPickerProps) {
  const [search, setSearch] = useState("");
  const {
    data: facilitators,
    isLoading,
    isError,
  } = usePlanningFacilitatorCandidates(search);

  function toggleFacilitator(userId: string) {
    onChange(
      selectedUserIds.includes(userId)
        ? selectedUserIds.filter((id) => id !== userId)
        : [...selectedUserIds, userId],
    );
  }

  const filteredFacilitators = (facilitators ?? []).filter(
    (facilitator: PlanningFacilitatorCandidate) => {
      if (!search.trim()) {
        return true;
      }

      const query = search.trim().toLowerCase();
      return (facilitator.fullName ?? "").toLowerCase().includes(query);
    },
  );

  return (
    <div>
      <p className="mb-3 text-sm text-carbon-black-600">{copy.facilitatorsHint}</p>
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={copy.facilitatorsSearchPlaceholder}
        disabled={disabled}
        className="mb-3 h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm disabled:opacity-50"
      />
      {isLoading ? (
        <p className="text-sm text-carbon-black-600">Laden...</p>
      ) : isError ? (
        <p className="text-sm text-red-600" role="alert">
          {copy.facilitatorsLoadError}
        </p>
      ) : !filteredFacilitators.length ? (
        <p className="text-sm text-carbon-black-600">{copy.emptyFacilitators}</p>
      ) : (
        <div className="space-y-2">
          {filteredFacilitators.map((facilitator) => (
            <label
              key={facilitator.userId}
              className="flex items-center gap-3 rounded-lg border border-dust-grey-100 p-3"
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={selectedUserIds.includes(facilitator.userId)}
                onChange={() => toggleFacilitator(facilitator.userId)}
                className="h-5 w-5 rounded border-dust-grey-300"
              />
              <span className="text-sm text-carbon-black-900">
                {facilitator.fullName ?? "Naamloos"}
                <span className="block text-xs text-carbon-black-500">
                  {formatRoleLabels(facilitator.roleNames)}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
