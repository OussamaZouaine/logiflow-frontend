import type { ApercuTone } from "../tableau/apercu";

export const STATUT_SANTE = [
  "BON",
  "SURVEILLER",
  "A_PLANIFIER",
  "CRITIQUE",
] as const;
export type StatutSante = (typeof STATUT_SANTE)[number];

export interface ScoreSante {
  calculeLe: string;
  dateEcheanceProjetee: string;
  id: string;
  kmAvantEcheance: number;
  necessiteIntervention: boolean;
  recommandation: string | null;
  score: number;
  statut: StatutSante;
  vehiculeId: string;
}

export interface ScoreSanteWrite {
  dateEcheanceProjetee: string;
  kmAvantEcheance: number;
  recommandation?: string | null;
  score: number;
  vehiculeId: string;
}

export interface ScoreSanteDraft {
  dateEcheanceProjetee: string;
  kmAvantEcheance: number;
  recommandation: string;
  score: number;
}

export function emptyScoreSanteDraft(): ScoreSanteDraft {
  const echeance = new Date();
  echeance.setMonth(echeance.getMonth() + 3);
  return {
    dateEcheanceProjetee: toDateInput(echeance),
    kmAvantEcheance: 5000,
    recommandation: "",
    score: 85,
  };
}

export function draftToWrite(
  vehiculeId: string,
  draft: ScoreSanteDraft
): ScoreSanteWrite {
  return {
    dateEcheanceProjetee: draft.dateEcheanceProjetee,
    kmAvantEcheance: draft.kmAvantEcheance,
    recommandation: draft.recommandation.trim() || null,
    score: draft.score,
    vehiculeId,
  };
}

export function isStatutSante(value: string): value is StatutSante {
  return (STATUT_SANTE as readonly string[]).includes(value);
}

export function statutSanteLabel(statut: StatutSante): string {
  switch (statut) {
    case "BON":
      return "Bon";
    case "SURVEILLER":
      return "À surveiller";
    case "A_PLANIFIER":
      return "À planifier";
    case "CRITIQUE":
      return "Critique";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function statutSanteTone(statut: StatutSante): ApercuTone {
  switch (statut) {
    case "BON":
      return "pine";
    case "SURVEILLER":
      return "amber";
    case "A_PLANIFIER":
      return "ink";
    case "CRITIQUE":
      return "brake";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("fr-FR");
}

function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
