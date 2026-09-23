export interface Station {
  actif: boolean;
  adresse: string | null;
  code: string;
  id: string;
  libelle: string;
}

export interface StationWrite {
  adresse: string | null;
  code: string;
  libelle: string;
}

export interface StationMaj {
  adresse: string | null;
  libelle: string;
}

export interface StationDraft {
  adresse: string;
  code: string;
  libelle: string;
}

export function emptyStationDraft(): StationDraft {
  return { adresse: "", code: "", libelle: "" };
}

export function stationToDraft(station: Station): StationDraft {
  return {
    adresse: station.adresse ?? "",
    code: station.code,
    libelle: station.libelle,
  };
}

export function draftToWrite(draft: StationDraft): StationWrite {
  const adresse = draft.adresse.trim();
  return {
    adresse: adresse.length > 0 ? adresse : null,
    code: draft.code.trim().toUpperCase(),
    libelle: draft.libelle.trim(),
  };
}

export function draftToMaj(draft: StationDraft): StationMaj {
  const adresse = draft.adresse.trim();
  return {
    adresse: adresse.length > 0 ? adresse : null,
    libelle: draft.libelle.trim(),
  };
}
