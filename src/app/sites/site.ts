export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Site {
  actif: boolean;
  adresse: string | null;
  clientId: string | null;
  code: string;
  id: string;
  libelle: string;
  localisation: GeoPoint | null;
}
