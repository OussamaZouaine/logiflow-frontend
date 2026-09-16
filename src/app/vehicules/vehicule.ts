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

export interface Vehicule {
  chargeUtileKg: number;
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
  immatriculation: string;
  ptacKg: number;
  type: VehiculeType;
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

