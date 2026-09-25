import { formatAmountDh } from "../core/api/money";
import type {
  Affectation,
  Portee,
  Trajet,
  TypeVoyage,
} from "../voyages/voyage";

/** Corps de POST /api/v1/ia/planification/propositions. */
export interface PlanificationRequest {
  debut: string;
  fin: string;
  nbOptions: number;
  portee: Portee;
  typeVoyage: TypeVoyage;
}

export interface ArretPropose {
  attenteMin: number;
  chargeApresKg: number;
  distanceDepuisPrecedentKm: number;
  dossiersCharges: string[];
  dossiersDecharges: string[];
  dureeDepuisPrecedentMin: number;
  eta: string;
  etd: string;
  fenetreRespectee: boolean;
  latitude: number;
  libelle: string;
  longitude: number;
  ordre: number;
  siteId: string;
}

export interface IndicateursOption {
  coutEstime: number;
  coutParTonne: number | null;
  distanceKm: number;
  dureeConduiteMin: number;
  dureeTotaleMin: number;
  fenetresManquees: number;
  nbDossiers: number;
  palettes: number;
  poidsKg: number;
  tauxRemplissagePoids: number;
  tauxRemplissageVolume: number;
  volumeM3: number;
}

export interface ConformiteOption {
  avertissements: string[];
  bloquants: string[];
  conforme: boolean;
}

/** Voyage au format de POST /api/v1/voyages, prêt à être relu puis créé. */
export interface VoyagePret {
  affectations: Affectation[];
  arrets: { siteId: string }[];
  arriveePrevue: string;
  departPrevu: string;
  dossierIds: string[];
  portee: Portee;
  remorqueId: string | null;
  trajet: Trajet;
  typeVoyage: TypeVoyage;
  vehiculeId: string;
}

export interface OptionVoyage {
  alertes: string[];
  arrets: ArretPropose[];
  arriveePrevue: string;
  chauffeurIds: string[];
  conformite: ConformiteOption;
  departPrevu: string;
  dossierIds: string[];
  indicateurs: IndicateursOption;
  justification: string;
  libelleObjectif: string;
  objectif: string;
  rang: number;
  recommandee: boolean;
  remorqueId: string | null;
  typeVoyage: TypeVoyage;
  vehiculeId: string;
  voyage: VoyagePret;
}

export interface LibellesPlanification {
  chauffeurs: Record<string, string>;
  dossiers: Record<string, string>;
  remorques: Record<string, string>;
  vehicules: Record<string, string>;
}

export interface PropositionsVoyage {
  comparaison: string;
  dossiersNonPlanifiables: string[];
  libelles: LibellesPlanification;
  nbDossiersCandidats: number;
  options: OptionVoyage[];
  portee: Portee;
  sourceDistances: "HAVERSINE" | "OSRM" | null;
  sourceRedaction: "GABARIT" | "LLM" | null;
}

export const NB_OPTIONS_MAX = 5;

/** Remplissage retenu : contrainte la plus limitante (poids ou volume). */
export function tauxRemplissage(indicateurs: IndicateursOption): number {
  return Math.max(
    indicateurs.tauxRemplissagePoids,
    indicateurs.tauxRemplissageVolume
  );
}

export function formatPourcentage(taux: number): string {
  return `${Math.round(taux * 100)} %`;
}

/** Montant arrondi dans la devise de l'application (DH). */
export function formatMontantArrondi(montant: number): string {
  return formatAmountDh(Math.round(montant));
}

export function formatHeure(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });
}

export function libelle(
  table: Record<string, string>,
  id: string | null | undefined
): string {
  if (!id) {
    return "—";
  }
  return table[id] ?? id;
}

/** Nature d'un arrêt pour la frise : chargement, déchargement ou les deux. */
export function natureArret(
  arret: Pick<ArretPropose, "dossiersCharges" | "dossiersDecharges">
): string {
  const charge = arret.dossiersCharges.length > 0;
  const decharge = arret.dossiersDecharges.length > 0;
  if (charge && decharge) {
    return "Chargement et déchargement";
  }
  return charge ? "Chargement" : "Déchargement";
}

/** Meilleure valeur de chaque indicateur, pour la mettre en valeur dans le comparatif. */
export function meilleuresValeurs(options: readonly OptionVoyage[]): {
  cout: number;
  distance: number;
  dossiers: number;
  remplissage: number;
} {
  return {
    cout: Math.min(...options.map((o) => o.indicateurs.coutEstime)),
    distance: Math.min(...options.map((o) => o.indicateurs.distanceKm)),
    dossiers: Math.max(...options.map((o) => o.indicateurs.nbDossiers)),
    remplissage: Math.max(
      ...options.map((o) => tauxRemplissage(o.indicateurs))
    ),
  };
}

export function sourceLabel(propositions: PropositionsVoyage): string {
  const distances =
    propositions.sourceDistances === "OSRM"
      ? "distances routières OSRM"
      : "distances estimées (vol d'oiseau × 1,3)";
  const redaction =
    propositions.sourceRedaction === "LLM"
      ? "commentaires rédigés par l'IA"
      : "commentaires générés sans IA";
  return `${distances} · ${redaction}`;
}
