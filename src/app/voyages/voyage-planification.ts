import type { OptionVoyage } from "../ia/planification";
import { isFieldSelectNone } from "../shared/ui/field-select";
import { datetimeLocalToDate } from "../shared/ui/iso-datetime";
import {
  draftToWrite,
  isoInstantToDatetimeLocal,
  type VoyageDraft,
  type VoyageLookupDossier,
  type VoyageWrite,
} from "./voyage";

/** Véhicule libre sur la période (GET /voyages/ressources-disponibles). */
export interface VehiculeDisponible {
  carrosserie: string | null;
  chargeUtileKg: number;
  id: string;
  immatriculation: string;
  statut: string;
  type: string;
}

export interface RemorqueDisponible {
  carrosserie: string | null;
  chargeUtileKg: number;
  groupeFroid: boolean;
  id: string;
  immatriculation: string;
  statut: string;
  volumeUtileM3: number;
}

export interface ChauffeurDisponible {
  categoriesPermis: string[];
  habilitationsValides: string[];
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
}

export interface RessourcesDisponibles {
  chauffeurs: ChauffeurDisponible[];
  remorques: RemorqueDisponible[];
  vehicules: VehiculeDisponible[];
}

export interface AnomalieConformite {
  bloquante: boolean;
  code: string;
  message: string;
}

export interface ArretVoyage {
  estOriginal: boolean;
  id: string;
  indiceSequence: number;
  latitude: number;
  libelle: string;
  longitude: number;
  siteId: string | null;
}

/** Réponse de POST /voyages/conformite (contrôle à blanc). */
export interface ConformiteVoyage {
  anomalies: AnomalieConformite[];
  arrets: ArretVoyage[];
  capaciteKg: number | null;
  chargeMaxKg: number;
  conforme: boolean;
  tauxRemplissage: number;
}

/** Corps de POST /voyages avec l'ordre des arrêts imposé (proposition de l'agent). */
export type VoyageWriteAvecArrets = VoyageWrite & {
  arrets?: { siteId: string }[];
};

export function formatVehiculeDisponible(v: VehiculeDisponible): string {
  const charge = `${Math.round(v.chargeUtileKg / 100) / 10} t`;
  return `${v.immatriculation} — ${v.type.toLowerCase()} · ${charge}`;
}

export function formatRemorqueDisponible(r: RemorqueDisponible): string {
  const carrosserie = r.carrosserie ? r.carrosserie.toLowerCase() : "remorque";
  return `${r.immatriculation} — ${carrosserie} · ${Math.round(r.chargeUtileKg / 100) / 10} t`;
}

export function formatChauffeurDisponible(c: ChauffeurDisponible): string {
  const permis =
    c.categoriesPermis.length > 0 ? ` · ${c.categoriesPermis.join("/")}` : "";
  const adr = c.habilitationsValides.includes("ADR_BASE") ? " · ADR" : "";
  return `${c.matricule} — ${c.prenom} ${c.nom}${permis}${adr}`;
}

/** Pré-remplit le brouillon du formulaire manuel avec une proposition de l'agent. */
export function draftDepuisProposition(
  option: OptionVoyage,
  courant: VoyageDraft
): VoyageDraft {
  const { voyage } = option;
  const titulaire = voyage.affectations.find((a) => a.role === "TITULAIRE");
  const renfort = voyage.affectations.find((a) => a.role === "RENFORT");
  return {
    ...courant,
    arriveePrevue: isoInstantToDatetimeLocal(voyage.arriveePrevue),
    chauffeurId: titulaire?.chauffeurId ?? "",
    chauffeurRenfortId: renfort?.chauffeurId ?? "",
    departPrevu: isoInstantToDatetimeLocal(voyage.departPrevu),
    distanceTotaleKm: Math.round(voyage.trajet.distanceTotaleKm),
    dureeConduiteMin: voyage.trajet.dureeConduiteMin,
    portee: voyage.portee,
    remorqueId: voyage.remorqueId ?? "",
    typeVoyage: voyage.typeVoyage,
    vehiculeId: voyage.vehiculeId,
  };
}

function memesDossiers(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

/**
 * Corps de création. Si une proposition a été choisie et que sa sélection de dossiers n'a pas
 * changé, on conserve son ordre d'arrêts et sa frise horaire (ETA/ETD par arrêt) ; les ressources,
 * dates et distance restent celles du formulaire, éventuellement retouchées par l'exploitant.
 */
export function voyageAEnvoyer(
  draft: VoyageDraft,
  dossierIds: readonly string[],
  dossiersById: ReadonlyMap<string, Pick<VoyageLookupDossier, "poidsBrutKg">>,
  proposition: OptionVoyage | null
): VoyageWriteAvecArrets {
  const base = draftToWrite(draft, dossierIds, dossiersById);
  if (!(proposition && memesDossiers(dossierIds, proposition.dossierIds))) {
    return base;
  }
  return {
    ...base,
    arrets: proposition.voyage.arrets,
    trajet: {
      ...proposition.voyage.trajet,
      distanceTotaleKm: draft.distanceTotaleKm,
      dureeConduiteMin: draft.dureeConduiteMin,
      dureeTotaleMin: Math.max(
        draft.dureeConduiteMin,
        base.trajet.dureeTotaleMin
      ),
    },
  };
}

/** Projet soumis au contrôle à blanc ; null tant que les dates ne sont pas valides. */
export function projetConformite(
  draft: VoyageDraft,
  dossierIds: readonly string[],
  proposition: OptionVoyage | null
): Record<string, unknown> | null {
  const depart = datetimeLocalToDate(draft.departPrevu);
  const arrivee = datetimeLocalToDate(draft.arriveePrevue);
  if (!(depart && arrivee) || arrivee <= depart || dossierIds.length === 0) {
    return null;
  }
  const corps = voyageAEnvoyer(draft, dossierIds, new Map(), proposition);
  return {
    ...corps,
    affectations:
      isFieldSelectNone(draft.chauffeurId) || !draft.chauffeurId
        ? []
        : corps.affectations,
    vehiculeId: draft.vehiculeId || null,
  };
}
