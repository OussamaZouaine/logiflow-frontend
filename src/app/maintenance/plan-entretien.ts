import type { VehiculeLookup } from "./ordre-travail";

export interface PlanEntretien {
  dureeEstimeeMin: number;
  id: string;
  libelle: string;
  periodiciteKm: number | null;
  periodiciteMois: number | null;
  seuilAlerteKm: number;
  vehiculeId: string;
}

/** POST body — mirrors OpenAPI `PlanEntretienRequest`. */
export interface PlanEntretienWrite {
  vehiculeId: string;
  libelle: string;
  periodiciteKm: number | null;
  periodiciteMois: number | null;
  seuilAlerteKm: number;
  dureeEstimeeMin: number;
}

export interface PlanEntretienDraft {
  dureeEstimeeMin: number;
  libelle: string;
  periodiciteKm: number | null;
  periodiciteMois: number | null;
  seuilAlerteKm: number;
  vehiculeId: string;
}

export function isPositivePeriodicity(value: number | null): boolean {
  return value != null && value > 0;
}

export function hasPlanPeriodicite(
  periodiciteKm: number | null,
  periodiciteMois: number | null
): boolean {
  return (
    isPositivePeriodicity(periodiciteKm) || isPositivePeriodicity(periodiciteMois)
  );
}

/** Swagger allows null; domain rejects both null or ≤ 0. */
function periodicityForApi(value: number | null): number | null {
  if (value == null || value <= 0) {
    return null;
  }
  return value;
}

export function emptyPlanEntretienDraft(): PlanEntretienDraft {
  return {
    dureeEstimeeMin: 60,
    libelle: "",
    periodiciteKm: 30_000,
    periodiciteMois: 12,
    seuilAlerteKm: 500,
    vehiculeId: "",
  };
}

export function draftToWrite(draft: PlanEntretienDraft): PlanEntretienWrite {
  return {
    vehiculeId: draft.vehiculeId,
    libelle: draft.libelle.trim(),
    periodiciteKm: periodicityForApi(draft.periodiciteKm),
    periodiciteMois: periodicityForApi(draft.periodiciteMois),
    seuilAlerteKm: draft.seuilAlerteKm,
    dureeEstimeeMin: draft.dureeEstimeeMin,
  };
}

export function formatPeriodicite(plan: PlanEntretien): string {
  const parts: string[] = [];
  if (plan.periodiciteKm != null) {
    parts.push(`${plan.periodiciteKm.toLocaleString("fr-FR")} km`);
  }
  if (plan.periodiciteMois != null) {
    parts.push(`${plan.periodiciteMois} mois`);
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function vehiculeLabel(
  vehiculeId: string,
  lookups: readonly VehiculeLookup[]
): string {
  const match = lookups.find((entry) => entry.id === vehiculeId);
  return match?.immatriculation ?? vehiculeId;
}
