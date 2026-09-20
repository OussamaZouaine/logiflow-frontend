import { isFieldSelectNone } from "../shared/ui/field-select";

export const VEHICULE_TYPES = ["TRACTEUR", "PORTEUR", "FOURGON"] as const;
export type VehiculeType = (typeof VEHICULE_TYPES)[number];

export const VEHICULE_ENERGIES = [
  "DIESEL",
  "ESSENCE",
  "ELECTRIQUE",
  "GNV",
  "GPL",
  "HYBRIDE",
] as const;
export type VehiculeEnergie = (typeof VEHICULE_ENERGIES)[number];

export const VEHICULE_CARROSSERIES = [
  "TAUTLINER",
  "FRIGORIFIQUE",
  "CITERNE",
  "PLATEAU",
  "BENNE",
  "PORTE_CONTENEUR",
] as const;
export type VehiculeCarrosserie = (typeof VEHICULE_CARROSSERIES)[number];

export const VEHICULE_STATUTS = [
  "DISPONIBLE",
  "RESERVE",
  "EN_VOYAGE",
  "EN_MAINTENANCE",
  "IMMOBILISE",
  "HORS_SERVICE",
] as const;
export type VehiculeStatut = (typeof VEHICULE_STATUTS)[number];

/** Véhicule tel que renvoyé par l'API (VehiculeResponse). */
export interface Vehicule {
  anneeMiseEnCirculation: number | null;
  chargeUtileKg: number;
  dateAcquisition: string | null;
  dateMiseEnService: string | null;
  datePremiereMiseCirculation: string | null;
  dateSortie: string | null;
  energie: string | null;
  groupeFroid: boolean;
  hauteurM: number | null;
  heuresMoteur: number;
  heuresMoteurSortie: number | null;
  id: string;
  immatriculation: string;
  kilometrage: number;
  kilometrageSortie: number | null;
  largeurM: number | null;
  longueurM: number | null;
  marque: string | null;
  modele: string | null;
  motifSortie: string | null;
  nbPositionsPalettes: number | null;
  numeroParc: string | null;
  poidsVideKg: number | null;
  ptacKg: number;
  statut: VehiculeStatut;
  temperatureMax: number | null;
  temperatureMin: number | null;
  type: VehiculeType;
  typeCarrosserie: string | null;
  vin: string | null;
  volumeUtileM3: number | null;
}

/** Corps de création, calqué sur VehiculeRequest côté backend. */
export interface VehiculeWrite {
  anneeMiseEnCirculation: number | null;
  chargeUtileKg: number;
  dateAcquisition: string | null;
  dateMiseEnService: string | null;
  datePremiereMiseCirculation: string | null;
  energie: VehiculeEnergie | null;
  groupeFroid: boolean;
  hauteurM: number | null;
  immatriculation: string;
  largeurM: number | null;
  longueurM: number | null;
  marque: string | null;
  modele: string | null;
  nbPositionsPalettes: number | null;
  numeroParc: string | null;
  poidsVideKg: number | null;
  ptacKg: number;
  temperatureMax: number | null;
  temperatureMin: number | null;
  type: VehiculeType;
  typeCarrosserie: VehiculeCarrosserie | null;
  vin: string | null;
  volumeUtileM3: number | null;
}

/** État du formulaire de création ("" = non renseigné pour textes/dates/sélections). */
export interface VehiculeDraft {
  anneeMiseEnCirculation: number | null;
  chargeUtileKg: number;
  dateAcquisition: string;
  dateMiseEnService: string;
  datePremiereMiseCirculation: string;
  energie: VehiculeEnergie | "";
  groupeFroid: boolean;
  hauteurM: number | null;
  immatriculation: string;
  largeurM: number | null;
  longueurM: number | null;
  marque: string;
  modele: string;
  nbPositionsPalettes: number | null;
  numeroParc: string;
  poidsVideKg: number | null;
  ptacKg: number;
  temperatureMax: number | null;
  temperatureMin: number | null;
  type: VehiculeType;
  typeCarrosserie: VehiculeCarrosserie | "";
  vin: string;
}

export function emptyVehiculeDraft(): VehiculeDraft {
  return {
    anneeMiseEnCirculation: null,
    chargeUtileKg: 9000,
    dateAcquisition: "",
    dateMiseEnService: "",
    datePremiereMiseCirculation: "",
    energie: "DIESEL",
    groupeFroid: false,
    hauteurM: null,
    immatriculation: "",
    largeurM: null,
    longueurM: null,
    marque: "",
    modele: "",
    nbPositionsPalettes: null,
    numeroParc: "",
    poidsVideKg: null,
    ptacKg: 19_000,
    temperatureMax: null,
    temperatureMin: null,
    type: "TRACTEUR",
    typeCarrosserie: "",
    vin: "",
  };
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** Volume utile (m³) = longueur × largeur × hauteur, arrondi à 2 décimales. */
export function computeVolumeUtileM3(
  longueurM: number | null,
  largeurM: number | null,
  hauteurM: number | null
): number | null {
  if (longueurM === null || largeurM === null || hauteurM === null) {
    return null;
  }
  if (longueurM < 0 || largeurM < 0 || hauteurM < 0) {
    return null;
  }
  return Math.round(longueurM * largeurM * hauteurM * 100) / 100;
}

export function draftToWrite(draft: VehiculeDraft): VehiculeWrite {
  return {
    anneeMiseEnCirculation: draft.anneeMiseEnCirculation,
    chargeUtileKg: draft.chargeUtileKg,
    dateAcquisition:
      draft.dateAcquisition === "" ? null : draft.dateAcquisition,
    dateMiseEnService:
      draft.dateMiseEnService === "" ? null : draft.dateMiseEnService,
    datePremiereMiseCirculation:
      draft.datePremiereMiseCirculation === ""
        ? null
        : draft.datePremiereMiseCirculation,
    energie: isFieldSelectNone(draft.energie)
      ? null
      : (draft.energie as VehiculeEnergie),
    groupeFroid: draft.groupeFroid,
    hauteurM: draft.hauteurM,
    immatriculation: draft.immatriculation.trim().toUpperCase(),
    largeurM: draft.largeurM,
    longueurM: draft.longueurM,
    marque: blankToNull(draft.marque),
    modele: blankToNull(draft.modele),
    nbPositionsPalettes: draft.nbPositionsPalettes,
    numeroParc: blankToNull(draft.numeroParc),
    poidsVideKg: draft.poidsVideKg,
    ptacKg: draft.ptacKg,
    temperatureMax: draft.groupeFroid ? draft.temperatureMax : null,
    temperatureMin: draft.groupeFroid ? draft.temperatureMin : null,
    type: draft.type,
    typeCarrosserie: isFieldSelectNone(draft.typeCarrosserie)
      ? null
      : (draft.typeCarrosserie as VehiculeCarrosserie),
    vin: blankToNull(draft.vin)?.toUpperCase() ?? null,
    volumeUtileM3: computeVolumeUtileM3(
      draft.longueurM,
      draft.largeurM,
      draft.hauteurM
    ),
  };
}

export function typeLabel(type: VehiculeType): string {
  switch (type) {
    case "TRACTEUR":
      return "Tracteur";
    case "PORTEUR":
      return "Porteur";
    case "FOURGON":
      return "Fourgon";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function energieLabel(energie: VehiculeEnergie): string {
  switch (energie) {
    case "DIESEL":
      return "Diesel";
    case "ESSENCE":
      return "Essence";
    case "ELECTRIQUE":
      return "Électrique";
    case "GNV":
      return "GNV";
    case "GPL":
      return "GPL";
    case "HYBRIDE":
      return "Hybride";
    default: {
      const _exhaustive: never = energie;
      return _exhaustive;
    }
  }
}

export function carrosserieLabel(carrosserie: VehiculeCarrosserie): string {
  switch (carrosserie) {
    case "TAUTLINER":
      return "Tautliner";
    case "FRIGORIFIQUE":
      return "Frigorifique";
    case "CITERNE":
      return "Citerne";
    case "PLATEAU":
      return "Plateau";
    case "BENNE":
      return "Benne";
    case "PORTE_CONTENEUR":
      return "Porte-conteneur";
    default: {
      const _exhaustive: never = carrosserie;
      return _exhaustive;
    }
  }
}

/** Libellés tolérants pour les valeurs renvoyées par l'API (string). */
export function energieDisplay(energie: string | null): string {
  if (!energie) {
    return "—";
  }
  if ((VEHICULE_ENERGIES as readonly string[]).includes(energie)) {
    return energieLabel(energie as VehiculeEnergie);
  }
  return energie;
}

export function carrosserieDisplay(carrosserie: string | null): string {
  if (!carrosserie) {
    return "—";
  }
  if ((VEHICULE_CARROSSERIES as readonly string[]).includes(carrosserie)) {
    return carrosserieLabel(carrosserie as VehiculeCarrosserie);
  }
  return carrosserie;
}

export function statutLabel(statut: VehiculeStatut): string {
  switch (statut) {
    case "DISPONIBLE":
      return "Disponible";
    case "RESERVE":
      return "Réservé";
    case "EN_VOYAGE":
      return "En voyage";
    case "EN_MAINTENANCE":
      return "En maintenance";
    case "IMMOBILISE":
      return "Immobilisé";
    case "HORS_SERVICE":
      return "Hors service";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

/** "Renault Trucks T 480", ou "—" si ni marque ni modèle. */
export function formatMarqueModele(
  marque: string | null,
  modele: string | null
): string {
  const parts = [marque?.trim(), modele?.trim()].filter(
    (part): part is string => !!part && part.length > 0
  );
  return parts.length > 0 ? parts.join(" ") : "—";
}

/** "2026-09-17" -> "17/09/2026", "" / null -> "—". */
export function formatVehiculeDate(isoDate: string | null): string {
  if (!isoDate) {
    return "—";
  }
  const parts = isoDate.slice(0, 10).split("-");
  if (parts.length !== 3) {
    return isoDate;
  }
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}
