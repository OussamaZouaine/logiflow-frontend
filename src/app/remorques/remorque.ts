import {
  CARROSSERIES_REQUISES,
  carrosserieRequiseLabel,
  type CarrosserieRequise,
} from "../dossiers/dossier";
import {
  statutLabel,
  VEHICULE_STATUTS,
  type VehiculeStatut,
} from "../vehicules/vehicule";
import { vehiculeStatutTone, type ApercuTone } from "../tableau/apercu";

export interface Remorque {
  anneeFabrication: number | null;
  carrosserie: string;
  chargeUtileKg: number;
  groupeFroid: boolean;
  heuresGroupeFroid: number;
  id: string;
  immatriculation: string;
  kilometrage: number;
  marque: string | null;
  modele: string | null;
  nbPositionsPalettes: number;
  numeroParc: string | null;
  statut: string;
  type: string | null;
  vin: string | null;
  volumeUtileM3: number;
}

export type RemorqueListItem = Pick<
  Remorque,
  | "carrosserie"
  | "chargeUtileKg"
  | "id"
  | "immatriculation"
  | "statut"
  | "volumeUtileM3"
>;

export interface RemorqueWrite {
  carrosserie: CarrosserieRequise;
  chargeUtileKg: number;
  groupeFroid: boolean;
  immatriculation: string;
  nbPositionsPalettes: number;
  volumeUtileM3: number;
}

export interface RemorqueDraft {
  carrosserie: CarrosserieRequise;
  chargeUtileKg: number;
  groupeFroid: boolean;
  immatriculation: string;
  nbPositionsPalettes: number;
  volumeUtileM3: number;
}

export function emptyRemorqueDraft(): RemorqueDraft {
  return {
    carrosserie: "TAUTLINER",
    chargeUtileKg: 24_000,
    groupeFroid: false,
    immatriculation: "",
    nbPositionsPalettes: 33,
    volumeUtileM3: 80,
  };
}

export function draftToWrite(draft: RemorqueDraft): RemorqueWrite {
  return {
    carrosserie: draft.carrosserie,
    chargeUtileKg: draft.chargeUtileKg,
    groupeFroid: draft.groupeFroid,
    immatriculation: draft.immatriculation.trim().toUpperCase(),
    nbPositionsPalettes: draft.nbPositionsPalettes,
    volumeUtileM3: draft.volumeUtileM3,
  };
}

export { CARROSSERIES_REQUISES, carrosserieRequiseLabel, VEHICULE_STATUTS };

export function isVehiculeStatut(value: string): value is VehiculeStatut {
  return (VEHICULE_STATUTS as readonly string[]).includes(value);
}

export function remorqueStatutLabel(statut: string): string {
  return isVehiculeStatut(statut) ? statutLabel(statut) : statut;
}

export function remorqueStatutTone(statut: string): ApercuTone {
  return isVehiculeStatut(statut) ? vehiculeStatutTone(statut) : "muted";
}

export function remorqueCarrosserieLabel(carrosserie: string): string {
  if ((CARROSSERIES_REQUISES as readonly string[]).includes(carrosserie)) {
    return carrosserieRequiseLabel(carrosserie as CarrosserieRequise);
  }
  return carrosserie;
}

export function formatRemorqueLabel(
  remorque: Pick<RemorqueListItem, "carrosserie" | "immatriculation" | "statut">
): string {
  return `${remorque.immatriculation} — ${remorqueCarrosserieLabel(remorque.carrosserie)} — ${remorqueStatutLabel(remorque.statut)}`;
}
