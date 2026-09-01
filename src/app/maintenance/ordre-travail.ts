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

export interface Money {
  devise: string;
  montant: number;
}

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

const TRANSITIONS: Record<StatutOT, readonly StatutOT[]> = {
  ANNULE: [],
  EN_COURS: ["TERMINE", "ANNULE"],
  PLANIFIE: ["EN_COURS", "ANNULE"],
  TERMINE: [],
};

const SESSION_KEY = "logiflow.ordres-travail";

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
    coutEstime: { devise: "EUR", montant: draft.montant },
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

export function formatMoney(money: Money): string {
  return `${money.montant.toLocaleString("fr-FR")} ${money.devise}`;
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

export function rememberOrdre(ordre: OrdreTravail): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  const current = rememberedOrdres().filter((item) => item.id !== ordre.id);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify([ordre, ...current]));
}

export function rememberedOrdres(): OrdreTravail[] {
  if (typeof sessionStorage === "undefined") {
    return [];
  }
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isOrdreTravail);
  } catch {
    return [];
  }
}

export function toDatetimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toLocalDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

function isOrdreTravail(value: unknown): value is OrdreTravail {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (
    !(
      "id" in value &&
      "vehiculeId" in value &&
      "type" in value &&
      "statut" in value &&
      "datePlanifiee" in value &&
      "dureeReelleMin" in value
    )
  ) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.vehiculeId === "string" &&
    typeof value.type === "string" &&
    typeof value.statut === "string" &&
    typeof value.datePlanifiee === "string" &&
    typeof value.dureeReelleMin === "number"
  );
}
