import { eurMoney, formatMoney, type Money } from "../core/api/money";
import type { ApercuTone } from "../tableau/apercu";
import { toDatetimeLocal } from "../shared/ui/iso-datetime";

export type { Money };
export { formatMoney };

export const TYPE_INTERVENTIONS = [
  "ENTRETIEN_PREVENTIF",
  "REPARATION",
  "CONTROLE_TECHNIQUE",
  "PNEUS",
  "AUTRE",
] as const;
export type TypeIntervention = (typeof TYPE_INTERVENTIONS)[number];

export const STATUT_OT = ["PLANIFIE", "EN_COURS", "TERMINE", "ANNULE"] as const;
export type StatutOT = (typeof STATUT_OT)[number];

export interface OrdreTravail {
  cout: Money;
  datePlanifiee: string;
  dureeReelleMin: number;
  id: string;
  statut: StatutOT;
  type: TypeIntervention;
  vehiculeId: string;
}

export interface OrdreTravailWrite {
  coutEstime: Money;
  datePlanifiee: string;
  type: TypeIntervention;
  vehiculeId: string;
}

export interface OrdreDraft {
  datePlanifiee: string;
  montant: number;
  type: TypeIntervention;
  vehiculeId: string;
}

export interface VehiculeLookup {
  id: string;
  immatriculation: string;
}

export function vehiculeLabel(
  vehiculeId: string,
  lookups: readonly VehiculeLookup[]
): string {
  const match = lookups.find((entry) => entry.id === vehiculeId);
  return match?.immatriculation ?? vehiculeId;
}

const TRANSITIONS: Record<StatutOT, readonly StatutOT[]> = {
  ANNULE: [],
  EN_COURS: ["TERMINE", "ANNULE"],
  PLANIFIE: ["EN_COURS", "ANNULE"],
  TERMINE: [],
};

export function emptyOrdreDraft(): OrdreDraft {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 24);
  return {
    datePlanifiee: toDatetimeLocal(date),
    montant: 250,
    type: "ENTRETIEN_PREVENTIF",
    vehiculeId: "",
  };
}

export function draftToWrite(draft: OrdreDraft): OrdreTravailWrite {
  return {
    coutEstime: eurMoney(draft.montant),
    datePlanifiee: toLocalDateTime(draft.datePlanifiee),
    type: draft.type,
    vehiculeId: draft.vehiculeId,
  };
}

export function nextStatuts(statut: StatutOT): readonly StatutOT[] {
  return TRANSITIONS[statut];
}

export function typeInterventionLabel(type: TypeIntervention): string {
  switch (type) {
    case "ENTRETIEN_PREVENTIF":
      return "Entretien préventif";
    case "REPARATION":
      return "Réparation";
    case "CONTROLE_TECHNIQUE":
      return "Contrôle technique";
    case "PNEUS":
      return "Pneus";
    case "AUTRE":
      return "Autre";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function statutOtLabel(statut: StatutOT): string {
  switch (statut) {
    case "PLANIFIE":
      return "Planifié";
    case "EN_COURS":
      return "En cours";
    case "TERMINE":
      return "Terminé";
    case "ANNULE":
      return "Annulé";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function statutOtTone(statut: StatutOT): ApercuTone {
  switch (statut) {
    case "PLANIFIE":
      return "amber";
    case "EN_COURS":
      return "pine";
    case "TERMINE":
      return "ink";
    case "ANNULE":
      return "brake";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Last UUID segment for compact ordre labels in lists and fiches. */
export function formatOrdreShortId(id: string): string {
  const segments = id.split("-");
  return segments.at(-1) ?? id;
}

export function formatDureeReelleMin(minutes: number): string {
  if (minutes <= 0) {
    return "0 min";
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) {
    return `${remainder} min`;
  }
  if (remainder === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${remainder} min`;
}

function toLocalDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}
