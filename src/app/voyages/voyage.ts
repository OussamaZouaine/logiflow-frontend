import { isFieldSelectNone } from "../shared/ui/field-select";
import {
  compareDatetimeLocal,
  datetimeLocalToIso,
  formatDatetimeLocalForDisplay,
  isoInstantToDatetimeLocal,
  maxDatetimeLocal,
  toDatetimeLocal,
} from "../shared/ui/iso-datetime";

export {
  compareDatetimeLocal,
  datetimeLocalToIso,
  formatDatetimeLocalForDisplay,
  isoInstantToDatetimeLocal,
  maxDatetimeLocal,
  toDatetimeLocal,
};

export const TYPE_VOYAGES = [
  "SIMPLE",
  "GROUPAGE",
  "RAMASSE",
  "DISTRIBUTION",
  "NAVETTE",
] as const;
export type TypeVoyage = (typeof TYPE_VOYAGES)[number];

export const PORTEES = ["NATIONAL", "INTERNATIONAL"] as const;
export type Portee = (typeof PORTEES)[number];

export const STATUT_VOYAGES = [
  "BROUILLON",
  "PLANIFIE",
  "AFFECTE",
  "EN_COURS",
  "TERMINE",
  "CLOTURE",
  "ANNULE",
] as const;
export type StatutVoyage = (typeof STATUT_VOYAGES)[number];

export const TYPE_ETAPES = [
  "CHARGEMENT",
  "DECHARGEMENT",
  "FRONTIERE",
  "PAUSE",
  "REPOS",
  "CARBURANT",
  "DEPOT",
] as const;
export type TypeEtape = (typeof TYPE_ETAPES)[number];

export const TYPE_EVENEMENTS = [
  "DEPART",
  "ARRIVEE_CHARGEMENT",
  "CHARGEMENT_TERMINE",
  "ARRIVEE_DECHARGEMENT",
  "LIVRAISON_TERMINEE",
  "POSITION",
  "INCIDENT",
  "CLOTURE",
] as const;
export type TypeEvenement = (typeof TYPE_EVENEMENTS)[number];

export const AFFECTATION_ROLES = ["TITULAIRE", "RENFORT"] as const;
export type AffectationRole = (typeof AFFECTATION_ROLES)[number];

/** Étape telle que définie dans `Etape` (OpenAPI). */
export interface Etape {
  chargeApresKg: number;
  distanceDepuisPrecedenteKm: number;
  eta: string;
  etd: string | null;
  ordre: number;
  type: TypeEtape;
}

/** Trajet tel que défini dans `Trajet` (OpenAPI). */
export interface Trajet {
  distanceTotaleKm: number;
  dureeConduiteMin: number;
  dureeTotaleMin: number;
  etapes: Etape[];
}

/** Affectation telle que définie dans `Affectation` (OpenAPI). */
export interface Affectation {
  chauffeurId: string;
  dateAffectation: string;
  role: AffectationRole;
}

/** Voyage tel que renvoyé par l'API (`VoyageResponse`). */
export interface Voyage {
  affectations: Affectation[];
  arriveePrevue: string;
  departPrevu: string;
  dossierIds: string[];
  id: string;
  portee: Portee;
  reference: string;
  remorqueId: string | null;
  statut: StatutVoyage;
  tauxRemplissage: number;
  trajet: Trajet;
  typeVoyage: TypeVoyage;
  vehiculeId: string;
}

/** Corps de création, calqué sur `VoyageRequest` côté backend. */
export interface VoyageWrite {
  affectations: Affectation[];
  arriveePrevue: string;
  departPrevu: string;
  dossierIds: string[];
  portee: Portee;
  remorqueId: string | null;
  trajet: Trajet;
  typeVoyage: TypeVoyage;
  vehiculeId: string;
}

export interface VoyageDraft {
  arriveePrevue: string;
  chauffeurId: string;
  /** Chauffeur de renfort (double équipage), optionnel. */
  chauffeurRenfortId: string;
  departPrevu: string;
  distanceTotaleKm: number;
  dureeConduiteMin: number;
  portee: Portee;
  remorqueId: string;
  typeVoyage: TypeVoyage;
  vehiculeId: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** Événement tel que renvoyé par l'API (`EvenementVoyageResponse`). */
export interface EvenementVoyage {
  commentaire: string | null;
  horodatage: string;
  id: string;
  position: GeoPoint | null;
  type: TypeEvenement;
  voyageId: string;
}

/** Corps de déclaration, calqué sur `EvenementVoyageRequest`. */
export interface EvenementVoyageWrite {
  commentaire: string | null;
  horodatage: string;
  position: GeoPoint | null;
  type: TypeEvenement;
  voyageId: string;
}

export function latestEvenementHorodatage(
  evenements: readonly EvenementVoyage[]
): string | null {
  if (evenements.length === 0) {
    return null;
  }
  let latest = evenements[0].horodatage;
  let latestMs = new Date(latest).getTime();
  for (let index = 1; index < evenements.length; index += 1) {
    const candidate = evenements[index].horodatage;
    const candidateMs = new Date(candidate).getTime();
    if (candidateMs > latestMs) {
      latest = candidate;
      latestMs = candidateMs;
    }
  }
  return latest;
}

export function minEvenementHorodatageLocal(
  evenements: readonly EvenementVoyage[]
): string | null {
  const latestIso = latestEvenementHorodatage(evenements);
  if (!latestIso) {
    return null;
  }
  const latestLocal = isoInstantToDatetimeLocal(latestIso);
  return latestLocal.length > 0 ? latestLocal : null;
}

export function suggestedEvenementHorodatageLocal(
  evenements: readonly EvenementVoyage[]
): string {
  const now = toDatetimeLocal(new Date());
  const minimum = minEvenementHorodatageLocal(evenements);
  if (!minimum) {
    return now;
  }
  return maxDatetimeLocal(now, minimum);
}

export interface VoyageLookupVehicule {
  id: string;
  immatriculation: string;
  statut: string;
}

export interface VoyageLookupDossier {
  id: string;
  poidsBrutKg: number;
  reference: string;
  statut: string;
  volumeM3: number;
}

const TRANSITIONS: Record<StatutVoyage, readonly StatutVoyage[]> = {
  AFFECTE: ["EN_COURS", "ANNULE"],
  ANNULE: [],
  BROUILLON: ["PLANIFIE", "ANNULE"],
  CLOTURE: [],
  EN_COURS: ["TERMINE"],
  PLANIFIE: ["AFFECTE", "ANNULE"],
  TERMINE: ["CLOTURE"],
};

export function emptyVoyageDraft(): VoyageDraft {
  const depart = new Date();
  depart.setMinutes(0, 0, 0);
  depart.setHours(depart.getHours() + 2);
  const arrivee = new Date(depart);
  arrivee.setHours(arrivee.getHours() + 8);
  return {
    arriveePrevue: toDatetimeLocal(arrivee),
    chauffeurId: "",
    chauffeurRenfortId: "",
    departPrevu: toDatetimeLocal(depart),
    distanceTotaleKm: 450,
    dureeConduiteMin: 360,
    portee: "NATIONAL",
    remorqueId: "",
    typeVoyage: "SIMPLE",
    vehiculeId: "",
  };
}

export function validateDossierIds(
  dossierIds: readonly string[]
): string | null {
  if (dossierIds.length === 0) {
    return "Sélectionnez au moins un dossier au statut Créé.";
  }
  return null;
}

export function totalChargeKgFromDossiers(
  dossierIds: readonly string[],
  dossiersById: ReadonlyMap<string, Pick<VoyageLookupDossier, "poidsBrutKg">>
): number {
  return dossierIds.reduce(
    (sum, id) => sum + (dossiersById.get(id)?.poidsBrutKg ?? 0),
    0
  );
}

export function formatVehiculeLookupLabel(
  vehicule: Pick<VoyageLookupVehicule, "immatriculation" | "statut">
): string {
  return `${vehicule.immatriculation} — ${vehicule.statut}`;
}

export function formatDossierVoyageLabel(
  dossier: Pick<VoyageLookupDossier, "poidsBrutKg" | "reference" | "volumeM3">
): string {
  return `${dossier.reference} — ${dossier.poidsBrutKg} kg · ${dossier.volumeM3} m³`;
}

/** Titulaire obligatoire, puis renfort s'il est choisi (et différent du titulaire). */
export function affectationsDepuisDraft(
  draft: Pick<VoyageDraft, "chauffeurId" | "chauffeurRenfortId">
): Affectation[] {
  const maintenant = new Date().toISOString();
  const affectations: Affectation[] = [
    {
      chauffeurId: draft.chauffeurId,
      dateAffectation: maintenant,
      role: "TITULAIRE",
    },
  ];
  const renfort = draft.chauffeurRenfortId.trim();
  if (!isFieldSelectNone(renfort) && renfort !== draft.chauffeurId) {
    affectations.push({
      chauffeurId: renfort,
      dateAffectation: maintenant,
      role: "RENFORT",
    });
  }
  return affectations;
}

/** Maps UI draft to POST /voyages — see {@link VoyageApi} for API contract. */
export function draftToWrite(
  draft: VoyageDraft,
  dossierIds: readonly string[],
  dossiersById: ReadonlyMap<
    string,
    Pick<VoyageLookupDossier, "poidsBrutKg">
  > = new Map()
): VoyageWrite {
  const departPrevu = datetimeLocalToIso(draft.departPrevu);
  const arriveePrevue = datetimeLocalToIso(draft.arriveePrevue);
  const spanMin = minutesBetween(draft.departPrevu, draft.arriveePrevue);
  const dureeTotaleMin = Math.max(draft.dureeConduiteMin, spanMin);
  const chargeApresKg = totalChargeKgFromDossiers(dossierIds, dossiersById);
  return {
    affectations: affectationsDepuisDraft(draft),
    arriveePrevue,
    departPrevu,
    dossierIds: [...dossierIds],
    portee: draft.portee,
    remorqueId: isFieldSelectNone(draft.remorqueId)
      ? null
      : draft.remorqueId.trim(),
    trajet: {
      distanceTotaleKm: draft.distanceTotaleKm,
      dureeConduiteMin: draft.dureeConduiteMin,
      dureeTotaleMin,
      etapes: [
        {
          chargeApresKg,
          distanceDepuisPrecedenteKm: 0,
          eta: departPrevu,
          etd: departPrevu,
          ordre: 0,
          type: "CHARGEMENT",
        },
        {
          chargeApresKg: 0,
          distanceDepuisPrecedenteKm: draft.distanceTotaleKm,
          eta: arriveePrevue,
          etd: null,
          ordre: 1,
          type: "DECHARGEMENT",
        },
      ],
    },
    typeVoyage: draft.typeVoyage,
    vehiculeId: draft.vehiculeId,
  };
}

export function nextStatuts(statut: StatutVoyage): readonly StatutVoyage[] {
  return TRANSITIONS[statut];
}

export function isTypeEvenement(value: string): value is TypeEvenement {
  return (TYPE_EVENEMENTS as readonly string[]).includes(value);
}

export function typeVoyageLabel(type: TypeVoyage): string {
  switch (type) {
    case "SIMPLE":
      return "Simple";
    case "GROUPAGE":
      return "Groupage";
    case "RAMASSE":
      return "Ramasse";
    case "DISTRIBUTION":
      return "Distribution";
    case "NAVETTE":
      return "Navette";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function porteeLabel(portee: Portee): string {
  switch (portee) {
    case "NATIONAL":
      return "National";
    case "INTERNATIONAL":
      return "International";
    default: {
      const _exhaustive: never = portee;
      return _exhaustive;
    }
  }
}

export function statutVoyageLabel(statut: StatutVoyage): string {
  switch (statut) {
    case "BROUILLON":
      return "Brouillon";
    case "PLANIFIE":
      return "Planifié";
    case "AFFECTE":
      return "Affecté";
    case "EN_COURS":
      return "En cours";
    case "TERMINE":
      return "Terminé";
    case "CLOTURE":
      return "Clôturé";
    case "ANNULE":
      return "Annulé";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function typeEtapeLabel(type: TypeEtape): string {
  switch (type) {
    case "CHARGEMENT":
      return "Chargement";
    case "DECHARGEMENT":
      return "Déchargement";
    case "FRONTIERE":
      return "Frontière";
    case "PAUSE":
      return "Pause";
    case "REPOS":
      return "Repos";
    case "CARBURANT":
      return "Carburant";
    case "DEPOT":
      return "Dépôt";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function affectationRoleLabel(role: AffectationRole): string {
  switch (role) {
    case "TITULAIRE":
      return "Titulaire";
    case "RENFORT":
      return "Renfort";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

export function typeEvenementLabel(type: TypeEvenement): string {
  switch (type) {
    case "DEPART":
      return "Départ";
    case "ARRIVEE_CHARGEMENT":
      return "Arrivée chargement";
    case "CHARGEMENT_TERMINE":
      return "Chargement terminé";
    case "ARRIVEE_DECHARGEMENT":
      return "Arrivée déchargement";
    case "LIVRAISON_TERMINEE":
      return "Livraison terminée";
    case "POSITION":
      return "Position";
    case "INCIDENT":
      return "Incident";
    case "CLOTURE":
      return "Clôture";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function formatInstant(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function remplissageLabel(taux: number): string {
  return `${Math.round(taux * 100)} %`;
}

/** Human-readable duration from minutes (e.g. "7 h 30"). */
export function formatDureeMin(minutes: number): string {
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
  return `${hours} h ${String(remainder).padStart(2, "0")}`;
}

function minutesBetween(fromLocal: string, toLocal: string): number {
  const from = new Date(fromLocal).getTime();
  const to = new Date(toLocal).getTime();
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from) {
    return 0;
  }
  return Math.round((to - from) / 60_000);
}
