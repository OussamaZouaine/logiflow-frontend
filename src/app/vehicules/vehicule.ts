export const VEHICULE_TYPES = ["TRACTEUR", "PORTEUR", "FOURGON"] as const;
export type VehiculeType = (typeof VEHICULE_TYPES)[number];

export const VEHICULE_STATUTS = [
  "DISPONIBLE",
  "RESERVE",
  "EN_VOYAGE",
  "EN_MAINTENANCE",
  "IMMOBILISE",
  "HORS_SERVICE",
] as const;
export type VehiculeStatut = (typeof VEHICULE_STATUTS)[number];

export const DOCUMENT_TYPES = [
  "CARTE_GRISE",
  "ASSURANCE",
  "CONTROLE_TECHNIQUE",
  "ADR",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface VehiculeDocument {
  dateExpiration: string;
  reference: string;
  type: DocumentType;
}

export interface Vehicule {
  chargeUtileKg: number;
  documents: VehiculeDocument[];
  heuresMoteur: number;
  id: string;
  immatriculation: string;
  kilometrage: number;
  ptacKg: number;
  statut: VehiculeStatut;
  type: VehiculeType;
}

export interface VehiculeWrite {
  chargeUtileKg: number;
  documents: VehiculeDocument[];
  immatriculation: string;
  ptacKg: number;
  type: VehiculeType;
}

export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
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

export function documentTypeLabel(type: DocumentType): string {
  switch (type) {
    case "CARTE_GRISE":
      return "Carte grise";
    case "ASSURANCE":
      return "Assurance";
    case "CONTROLE_TECHNIQUE":
      return "Contrôle technique";
    case "ADR":
      return "ADR";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
