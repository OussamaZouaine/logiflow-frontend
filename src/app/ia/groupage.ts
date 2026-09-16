import type { Dossier } from "../dossiers/dossier";

export interface PropositionGroupage {
  confiance: number | null;
  dossierIds: string[];
  gainKm: number | null;
  gainMarge: number | null;
  genereParIa: boolean;
  justification: string;
  score: number | null;
}

export interface GroupageAnalyseRequest {
  dossierIds: string[];
}

/** CREE dossiers eligible for groupage suggestions. */
export function groupageCandidateDossiers(
  dossiers: readonly Pick<Dossier, "id" | "statut" | "groupable">[]
): readonly Pick<Dossier, "id" | "statut" | "groupable">[] {
  return dossiers.filter(
    (dossier) => dossier.statut === "CREE" && dossier.groupable
  );
}

export function canSuggererGroupage(
  dossiers: readonly Pick<Dossier, "id" | "statut" | "groupable">[]
): boolean {
  return groupageCandidateDossiers(dossiers).length >= 2;
}

export function groupageCandidateIds(
  dossiers: readonly Pick<Dossier, "id" | "statut" | "groupable">[]
): string[] {
  return groupageCandidateDossiers(dossiers).map((dossier) => dossier.id);
}

export function dossierReferencesForIds(
  dossierIds: readonly string[],
  dossiersById: ReadonlyMap<string, Pick<Dossier, "reference">>
): string[] {
  return dossierIds.map(
    (id) => dossiersById.get(id)?.reference ?? id.slice(0, 8)
  );
}

export function formatPropositionScore(score: number | null | undefined): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return "—";
  }
  return `${Math.round(score * 100)} %`;
}

export function formatPropositionGainKm(
  gainKm: number | null | undefined
): string | null {
  if (gainKm === null || gainKm === undefined || Number.isNaN(gainKm)) {
    return null;
  }
  const rounded = Math.round(gainKm);
  if (rounded === 0) {
    return null;
  }
  return `${rounded.toLocaleString("fr-FR")} km`;
}

export function propositionSourceLabel(genereParIa: boolean): string {
  return genereParIa ? "IA" : "Repli";
}
