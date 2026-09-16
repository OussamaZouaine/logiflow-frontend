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

export interface PlanEntretienWrite {
  dureeEstimeeMin: number;
  libelle: string;
  periodiciteKm?: number | null;
  periodiciteMois?: number | null;
  seuilAlerteKm: number;
  vehiculeId: string;
}

export interface PlanEntretienDraft {
  dureeEstimeeMin: number;
  libelle: string;
  periodiciteKm: number | null;
  periodiciteMois: number | null;
  seuilAlerteKm: number;
  vehiculeId: string;
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
    dureeEstimeeMin: draft.dureeEstimeeMin,
    libelle: draft.libelle.trim(),
    periodiciteKm: draft.periodiciteKm,
    periodiciteMois: draft.periodiciteMois,
    seuilAlerteKm: draft.seuilAlerteKm,
    vehiculeId: draft.vehiculeId,
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
