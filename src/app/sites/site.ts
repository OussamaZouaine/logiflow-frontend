export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface SiteContraintesAcces {
  hauteurMaxMetres: number | null;
  instructions: string | null;
  interditPoidsLourd: boolean;
  poidsMaxTonnes: number | null;
}

export interface Site {
  actif: boolean;
  adresse: string | null;
  clientId: string | null;
  code: string;
  contraintesAcces: SiteContraintesAcces | null;
  id: string;
  libelle: string;
  localisation: GeoPoint;
}

export interface SiteWrite {
  adresse: string | null;
  clientId: string | null;
  code: string;
  contraintesAcces: SiteContraintesAcces;
  horaires: [];
  libelle: string;
  localisation: GeoPoint;
}

export interface SiteDraft {
  adresse: string;
  code: string;
  interditPoidsLourd: boolean;
  latitude: number;
  libelle: string;
  longitude: number;
}

export function emptySiteDraft(): SiteDraft {
  return {
    adresse: "",
    code: "",
    interditPoidsLourd: false,
    latitude: 48.8566,
    libelle: "",
    longitude: 2.3522,
  };
}

export function siteToDraft(site: Site): SiteDraft {
  return {
    adresse: site.adresse ?? "",
    code: site.code,
    interditPoidsLourd: site.contraintesAcces?.interditPoidsLourd ?? false,
    latitude: site.localisation.latitude,
    libelle: site.libelle,
    longitude: site.localisation.longitude,
  };
}

export function draftToWrite(draft: SiteDraft): SiteWrite {
  const adresse = draft.adresse.trim();
  return {
    adresse: adresse.length > 0 ? adresse : null,
    clientId: null,
    code: draft.code.trim().toUpperCase(),
    contraintesAcces: {
      hauteurMaxMetres: null,
      instructions: null,
      interditPoidsLourd: draft.interditPoidsLourd,
      poidsMaxTonnes: null,
    },
    horaires: [],
    libelle: draft.libelle.trim(),
    localisation: {
      latitude: draft.latitude,
      longitude: draft.longitude,
    },
  };
}
