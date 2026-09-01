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

export interface Etape {
  chargeApresKg: number;
  distanceDepuisPrecedenteKm: number;
  eta: string;
  etd: string | null;
  ordre: number;
  type: TypeEtape;
}

export interface Trajet {
  distanceTotaleKm: number;
  dureeConduiteMin: number;
  dureeTotaleMin: number;
  etapes: Etape[];
}

export interface Affectation {
  chauffeurId: string;
  dateAffectation: string;
  role: "TITULAIRE" | "RENFORT";
}

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
  departPrevu: string;
  distanceTotaleKm: number;
  dossierId: string;
  dureeConduiteMin: number;
  portee: Portee;
  typeVoyage: TypeVoyage;
  vehiculeId: string;
}

export interface EvenementVoyage {
  commentaire: string | null;
  horodatage: string;
  id: string;
  position: { latitude: number; longitude: number } | null;
  type: TypeEvenement;
  voyageId: string;
}

export interface VoyageLookupVehicule {
  id: string;
  immatriculation: string;
  statut: string;
}

export interface VoyageLookupDossier {
  id: string;
  reference: string;
  statut: string;
}

export interface VoyageLookupChauffeur {
  id: string;
  matricule: string;
  nomComplet: string;
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
    departPrevu: toDatetimeLocal(depart),
    distanceTotaleKm: 450,
    dossierId: "",
    dureeConduiteMin: 360,
    portee: "NATIONAL",
    typeVoyage: "SIMPLE",
    vehiculeId: "",
  };
}

export function draftToWrite(draft: VoyageDraft): VoyageWrite {
  const departPrevu = datetimeLocalToIso(draft.departPrevu);
  const arriveePrevue = datetimeLocalToIso(draft.arriveePrevue);
  const spanMin = minutesBetween(draft.departPrevu, draft.arriveePrevue);
  const dureeTotaleMin = Math.max(draft.dureeConduiteMin, spanMin);
  return {
    affectations: [
      {
        chauffeurId: draft.chauffeurId,
        dateAffectation: new Date().toISOString(),
        role: "TITULAIRE",
      },
    ],
    arriveePrevue,
    departPrevu,
    dossierIds: [draft.dossierId],
    portee: draft.portee,
    remorqueId: null,
    trajet: {
      distanceTotaleKm: draft.distanceTotaleKm,
      dureeConduiteMin: draft.dureeConduiteMin,
      dureeTotaleMin,
      etapes: [
        {
          chargeApresKg: 500,
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

export function toDatetimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function datetimeLocalToIso(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Date invalide.");
  }
  return parsed.toISOString();
}

function minutesBetween(fromLocal: string, toLocal: string): number {
  const from = new Date(fromLocal).getTime();
  const to = new Date(toLocal).getTime();
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from) {
    return 0;
  }
  return Math.round((to - from) / 60_000);
}
