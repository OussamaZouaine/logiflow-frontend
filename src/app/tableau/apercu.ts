import {
  type PriseCarburant,
  STATUT_PRISES,
  type StatutPrise,
  statutPriseLabel,
} from "../carburant/prise-carburant";
import {
  type Commande,
  STATUT_COMMANDES,
  type StatutCommande,
  statutCommandeLabel,
} from "../commandes/commande";
import type { PageResponse } from "../core/api/page-response";
import type {
  WorkDestination,
  WorkDestinationId,
} from "../core/nav/work-destination";
import {
  type Dossier,
  STATUT_DOSSIERS,
  type StatutDossier,
  statutDossierLabel,
} from "../dossiers/dossier";
import {
  statutLabel,
  VEHICULE_STATUTS,
  type Vehicule,
  type VehiculeStatut,
} from "../vehicules/vehicule";
import {
  STATUT_VOYAGES,
  type StatutVoyage,
  statutVoyageLabel,
  type Voyage,
} from "../voyages/voyage";

/** Backend `PageRequest` rejects size above 100. */
export const APERCU_CHART_PAGE_SIZE = 100;
export const APERCU_COUNT_PAGE_SIZE = 1;

export const APERCU_COUNTABLE_IDS = [
  "sites",
  "vehicules",
  "commandes",
  "dossiers",
  "voyages",
  "carburant",
  "maintenance",
  "utilisateurs",
] as const satisfies readonly WorkDestinationId[];

export type ApercuCountableId = (typeof APERCU_COUNTABLE_IDS)[number];

export type ApercuTone = "amber" | "pine" | "ink" | "muted" | "brake";

export interface StatutSlice {
  count: number;
  key: string;
  label: string;
  tone: ApercuTone;
}

const COUNTABLE = new Set<WorkDestinationId>(APERCU_COUNTABLE_IDS);

export type ApercuDestination = WorkDestination & { id: ApercuCountableId };

export function isApercuCountable(
  id: WorkDestinationId
): id is ApercuCountableId {
  return COUNTABLE.has(id);
}

export function apercuDestinations(
  destinations: readonly WorkDestination[]
): ApercuDestination[] {
  return destinations.filter((destination): destination is ApercuDestination =>
    isApercuCountable(destination.id)
  );
}

/** List API segment (differs from sidebar path for maintenance). */
export function apercuApiPath(id: ApercuCountableId): string {
  if (id === "maintenance") {
    return "maintenance/ordres-travail";
  }
  if (id === "carburant") {
    return "prises-carburant";
  }
  return id;
}

export function isCompleteCollection<T>(page: PageResponse<T>): boolean {
  return page.content.length === page.totalElements;
}

export function shouldShowStatutBreakdown<T>(page: PageResponse<T>): boolean {
  return page.totalElements > 0 && isCompleteCollection(page);
}

export function apercuToneClass(tone: ApercuTone): string {
  switch (tone) {
    case "amber":
      return "bg-amber";
    case "pine":
      return "bg-pine";
    case "ink":
      return "bg-ink";
    case "muted":
      return "bg-secondary";
    case "brake":
      return "bg-brake";
    default: {
      const _exhaustive: never = tone;
      return _exhaustive;
    }
  }
}

/** Left accent for file-du-jour cards and similar surfaces. */
export function apercuToneBorderClass(tone: ApercuTone): string {
  switch (tone) {
    case "amber":
      return "border-l-amber";
    case "pine":
      return "border-l-pine";
    case "ink":
      return "border-l-ink";
    case "muted":
      return "border-l-secondary";
    case "brake":
      return "border-l-brake";
    default: {
      const _exhaustive: never = tone;
      return _exhaustive;
    }
  }
}

/** Text on filled tone badges (utility bar, chart segments). */
export function apercuToneOnFillClass(tone: ApercuTone): string {
  return tone === "muted" ? "text-muted" : "text-surface";
}

export function vehiculeStatutSlices(
  vehicules: readonly Pick<Vehicule, "statut">[]
): StatutSlice[] {
  return slicesFor(
    vehicules.map((vehicule) => vehicule.statut),
    VEHICULE_STATUTS,
    statutLabel,
    vehiculeStatutTone
  );
}

export function voyageStatutSlices(
  voyages: readonly Pick<Voyage, "statut">[]
): StatutSlice[] {
  return slicesFor(
    voyages.map((voyage) => voyage.statut),
    STATUT_VOYAGES,
    statutVoyageLabel,
    voyageStatutTone
  );
}

export function commandeStatutSlices(
  commandes: readonly Pick<Commande, "statut">[]
): StatutSlice[] {
  return slicesFor(
    commandes.map((commande) => commande.statut),
    STATUT_COMMANDES,
    statutCommandeLabel,
    commandeStatutTone
  );
}

export function priseStatutSlices(
  prises: readonly Pick<PriseCarburant, "statut">[]
): StatutSlice[] {
  return slicesFor(
    prises.map((prise) => prise.statut),
    STATUT_PRISES,
    statutPriseLabel,
    priseStatutTone
  );
}

export function dossierStatutSlices(
  dossiers: readonly Pick<Dossier, "statut">[]
): StatutSlice[] {
  return slicesFor(
    dossiers.map((dossier) => dossier.statut),
    STATUT_DOSSIERS,
    statutDossierLabel,
    dossierStatutTone
  );
}

function slicesFor<S extends string>(
  values: readonly S[],
  order: readonly S[],
  labelOf: (statut: S) => string,
  toneOf: (statut: S) => ApercuTone
): StatutSlice[] {
  const counts = new Map<S, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return order
    .map((key) => ({
      count: counts.get(key) ?? 0,
      key,
      label: labelOf(key),
      tone: toneOf(key),
    }))
    .filter((slice) => slice.count > 0);
}

export function vehiculeStatutTone(statut: VehiculeStatut): ApercuTone {
  switch (statut) {
    case "DISPONIBLE":
      return "pine";
    case "RESERVE":
      return "muted";
    case "EN_VOYAGE":
      return "ink";
    case "EN_MAINTENANCE":
      return "amber";
    case "IMMOBILISE":
    case "HORS_SERVICE":
      return "brake";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function voyageStatutTone(statut: StatutVoyage): ApercuTone {
  switch (statut) {
    case "BROUILLON":
    case "CLOTURE":
      return "muted";
    case "EN_COURS":
      return "pine";
    case "PLANIFIE":
    case "AFFECTE":
      return "amber";
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

export function priseStatutTone(statut: StatutPrise): ApercuTone {
  switch (statut) {
    case "BROUILLON":
      return "amber";
    case "VALIDEE":
      return "pine";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function commandeStatutTone(statut: StatutCommande): ApercuTone {
  switch (statut) {
    case "RECUE":
      return "amber";
    case "CONFIRMEE":
      return "pine";
    case "ANNULEE":
      return "brake";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function dossierStatutTone(statut: StatutDossier): ApercuTone {
  switch (statut) {
    case "CREE":
    case "PLANIFIE":
      return "muted";
    case "EN_CHARGEMENT":
    case "CHARGE":
    case "EN_TRANSIT":
    case "EN_LIVRAISON":
      return "pine";
    case "LIVRE":
    case "CLOTURE":
      return "ink";
    case "INCIDENT":
    case "ANNULE":
      return "brake";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}
