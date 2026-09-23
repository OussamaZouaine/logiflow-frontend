export interface VoyageCapaciteArret {
  id: string;
  indiceSequence: number;
  libelle: string;
}

export interface VoyageCapaciteTroncon {
  indiceTroncon: number;
  arretDepartId: string;
  arretArriveeId: string;
  poidsUtiliseKg: number;
  volumeUtiliseM3: number;
  pourcentagePoids: number;
  pourcentageVolume: number;
  pourcentageMax: number;
}

export interface VoyageCapacite {
  capacitePoidsKg: number;
  capaciteVolumeM3: number;
  arrets: VoyageCapaciteArret[];
  troncons: VoyageCapaciteTroncon[];
}

export type CapaciteTronconTone = "pine" | "amber" | "brake";

export function capaciteTronconTone(
  pourcentageMax: number
): CapaciteTronconTone {
  if (pourcentageMax >= 90) {
    return "brake";
  }
  if (pourcentageMax >= 70) {
    return "amber";
  }
  return "pine";
}

export function capaciteTronconToneClass(tone: CapaciteTronconTone): string {
  switch (tone) {
    case "pine":
      return "bg-pine";
    case "amber":
      return "bg-amber";
    case "brake":
      return "bg-brake";
    default: {
      const _exhaustive: never = tone;
      return _exhaustive;
    }
  }
}

export function capaciteTronconLabel(pourcentageMax: number): string {
  return `${Math.round(pourcentageMax)} %`;
}

export function tronconParDepart(
  troncons: VoyageCapaciteTroncon[],
  arretDepartId: string
): VoyageCapaciteTroncon | undefined {
  return troncons.find((troncon) => troncon.arretDepartId === arretDepartId);
}
