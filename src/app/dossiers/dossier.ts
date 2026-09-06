import {
  datetimeLocalToIso,
  formatInstant,
  toDatetimeLocal,
} from "../voyages/voyage";

export { formatInstant };

export const TYPE_TRANSPORTS = [
  "NATIONAL",
  "EXPORT",
  "IMPORT",
  "TRANSIT",
] as const;
export type TypeTransport = (typeof TYPE_TRANSPORTS)[number];

export const TYPE_SEGMENTS = ["CHARGEMENT", "DECHARGEMENT"] as const;
export type TypeSegment = (typeof TYPE_SEGMENTS)[number];

export const CARROSSERIES_REQUISES = [
  "TAUTLINER",
  "FRIGORIFIQUE",
  "CITERNE",
  "PLATEAU",
  "BENNE",
  "PORTE_CONTENEUR",
] as const;
export type CarrosserieRequise = (typeof CARROSSERIES_REQUISES)[number];

export const STATUT_DOSSIERS = [
  "CREE",
  "PLANIFIE",
  "EN_CHARGEMENT",
  "CHARGE",
  "EN_TRANSIT",
  "EN_LIVRAISON",
  "LIVRE",
  "CLOTURE",
  "INCIDENT",
  "ANNULE",
] as const;
export type StatutDossier = (typeof STATUT_DOSSIERS)[number];

export interface TimeWindow {
  debut: string;
  fin: string;
}

export interface LigneMarchandise {
  classeAdr: string | null;
  designation: string;
  gerbable: boolean;
  nbColis: number;
  numeroOnu: string | null;
  poidsKg: number;
  volumeM3: number;
}

export interface Segment {
  fenetre: TimeWindow;
  ordre: number;
  realiseLe: string | null;
  siteId: string;
  type: TypeSegment;
}

export interface Dossier {
  carrosserieRequise: CarrosserieRequise | null;
  commandeId: string;
  contientAdr: boolean;
  documents: unknown[];
  familleMarchandise: string;
  groupable: boolean;
  id: string;
  lignesMarchandise: LigneMarchandise[];
  nbPalettes: number;
  poidsBrutKg: number;
  reference: string;
  segments: Segment[];
  statut: StatutDossier;
  temperatureRequise: number | null;
  typeTransport: TypeTransport;
  volumeM3: number;
}

export interface DossierWrite {
  carrosserieRequise: CarrosserieRequise | null;
  commandeId: string;
  documents: unknown[];
  familleMarchandise: string;
  groupable: boolean;
  lignesMarchandise: LigneMarchandise[];
  nbPalettes: number;
  segments: Segment[];
  temperatureRequise: number | null;
  typeTransport: TypeTransport;
}

export interface DossierDraft {
  carrosserieRequise: string;
  chargementDebut: string;
  chargementFin: string;
  chargementSiteId: string;
  classeAdr: string;
  commandeId: string;
  dechargementDebut: string;
  dechargementFin: string;
  dechargementSiteId: string;
  designation: string;
  familleMarchandise: string;
  gerbable: boolean;
  groupable: boolean;
  nbColis: number;
  nbPalettes: number;
  numeroOnu: string;
  poidsKg: number;
  temperatureRequise: string;
  typeTransport: TypeTransport;
  volumeM3: number;
}

export interface DossierLookupCommande {
  id: string;
  reference: string;
  statut: string;
}

export interface DossierLookupSite {
  actif: boolean;
  code: string;
  id: string;
  libelle: string;
}

export function formatSiteLabel(
  site: Pick<DossierLookupSite, "code" | "libelle">
): string {
  return `${site.code} — ${site.libelle}`;
}

export function siteLabelFromLookup(
  siteId: string,
  sitesById: ReadonlyMap<string, DossierLookupSite>
): string {
  const site = sitesById.get(siteId);
  return site ? formatSiteLabel(site) : siteId;
}

const TRANSITIONS: Record<StatutDossier, readonly StatutDossier[]> = {
  ANNULE: [],
  CHARGE: ["EN_TRANSIT", "ANNULE"],
  CLOTURE: [],
  CREE: ["PLANIFIE", "ANNULE"],
  EN_CHARGEMENT: ["CHARGE", "ANNULE"],
  EN_LIVRAISON: ["LIVRE"],
  EN_TRANSIT: ["EN_LIVRAISON", "INCIDENT"],
  INCIDENT: ["EN_TRANSIT", "ANNULE"],
  LIVRE: ["CLOTURE"],
  PLANIFIE: ["CREE", "EN_CHARGEMENT", "ANNULE"],
};

export function emptyDossierDraft(commandeId = ""): DossierDraft {
  const chargementDebut = new Date();
  chargementDebut.setDate(chargementDebut.getDate() + 1);
  chargementDebut.setHours(8, 0, 0, 0);
  const chargementFin = new Date(chargementDebut);
  chargementFin.setHours(10, 0, 0, 0);
  const dechargementDebut = new Date(chargementDebut);
  dechargementDebut.setDate(dechargementDebut.getDate() + 1);
  dechargementDebut.setHours(14, 0, 0, 0);
  const dechargementFin = new Date(dechargementDebut);
  dechargementFin.setHours(16, 0, 0, 0);

  return {
    carrosserieRequise: "",
    chargementDebut: toDatetimeLocal(chargementDebut),
    chargementFin: toDatetimeLocal(chargementFin),
    chargementSiteId: "",
    classeAdr: "",
    commandeId,
    dechargementDebut: toDatetimeLocal(dechargementDebut),
    dechargementFin: toDatetimeLocal(dechargementFin),
    dechargementSiteId: "",
    designation: "Palettes standard",
    familleMarchandise: "Palettes standard",
    gerbable: true,
    groupable: true,
    nbColis: 10,
    nbPalettes: 10,
    numeroOnu: "",
    poidsKg: 500,
    temperatureRequise: "",
    typeTransport: "NATIONAL",
    volumeM3: 2.5,
  };
}

export function draftToWrite(draft: DossierDraft): DossierWrite {
  const classeAdr = draft.classeAdr.trim();
  const numeroOnu = draft.numeroOnu.trim();
  const temperature = draft.temperatureRequise.trim();
  const carrosserie = draft.carrosserieRequise.trim();

  return {
    carrosserieRequise: isCarrosserieRequise(carrosserie) ? carrosserie : null,
    commandeId: draft.commandeId,
    documents: [],
    familleMarchandise: draft.familleMarchandise.trim(),
    groupable: draft.groupable,
    lignesMarchandise: [
      {
        classeAdr: classeAdr.length > 0 ? classeAdr : null,
        designation: draft.designation.trim(),
        gerbable: draft.gerbable,
        nbColis: draft.nbColis,
        numeroOnu: numeroOnu.length > 0 ? numeroOnu : null,
        poidsKg: draft.poidsKg,
        volumeM3: draft.volumeM3,
      },
    ],
    nbPalettes: draft.nbPalettes,
    segments: [
      {
        fenetre: {
          debut: datetimeLocalToIso(draft.chargementDebut),
          fin: datetimeLocalToIso(draft.chargementFin),
        },
        ordre: 0,
        realiseLe: null,
        siteId: draft.chargementSiteId,
        type: "CHARGEMENT",
      },
      {
        fenetre: {
          debut: datetimeLocalToIso(draft.dechargementDebut),
          fin: datetimeLocalToIso(draft.dechargementFin),
        },
        ordre: 1,
        realiseLe: null,
        siteId: draft.dechargementSiteId,
        type: "DECHARGEMENT",
      },
    ],
    temperatureRequise:
      temperature.length > 0 ? Number.parseFloat(temperature) : null,
    typeTransport: draft.typeTransport,
  };
}

export function nextStatuts(statut: StatutDossier): readonly StatutDossier[] {
  return TRANSITIONS[statut];
}

/** Statut changes the UI may offer — voyage-owned transitions are excluded. */
export function manualNextStatuts(
  statut: StatutDossier
): readonly StatutDossier[] {
  return nextStatuts(statut).filter((next) => {
    if (next === "PLANIFIE") {
      return false;
    }
    if (statut === "PLANIFIE" && next === "CREE") {
      return false;
    }
    return true;
  });
}

export function isStatutDossier(value: string): value is StatutDossier {
  return (STATUT_DOSSIERS as readonly string[]).includes(value);
}

export function isCarrosserieRequise(value: string): value is CarrosserieRequise {
  return (CARROSSERIES_REQUISES as readonly string[]).includes(value);
}

export function typeTransportLabel(type: TypeTransport): string {
  switch (type) {
    case "NATIONAL":
      return "National";
    case "EXPORT":
      return "Export";
    case "IMPORT":
      return "Import";
    case "TRANSIT":
      return "Transit";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function typeSegmentLabel(type: TypeSegment): string {
  switch (type) {
    case "CHARGEMENT":
      return "Chargement";
    case "DECHARGEMENT":
      return "Déchargement";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function carrosserieRequiseLabel(
  carrosserie: CarrosserieRequise
): string {
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

export function statutDossierLabel(statut: StatutDossier): string {
  switch (statut) {
    case "CREE":
      return "Créé";
    case "PLANIFIE":
      return "Planifié";
    case "EN_CHARGEMENT":
      return "En chargement";
    case "CHARGE":
      return "Chargé";
    case "EN_TRANSIT":
      return "En transit";
    case "EN_LIVRAISON":
      return "En livraison";
    case "LIVRE":
      return "Livré";
    case "CLOTURE":
      return "Clôturé";
    case "INCIDENT":
      return "Incident";
    case "ANNULE":
      return "Annulé";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function formatWindow(window: TimeWindow): string {
  return `${formatInstant(window.debut)} → ${formatInstant(window.fin)}`;
}
