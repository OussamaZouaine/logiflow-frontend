export interface Marchandise {
  actif: boolean;
  classeAdr: string | null;
  code: string;
  famille: string | null;
  gerbable: boolean;
  id: string;
  libelle: string;
  numeroOnu: string | null;
}

export interface MarchandiseWrite {
  classeAdr?: string;
  code: string;
  famille?: string;
  gerbable: boolean;
  libelle: string;
  numeroOnu?: string;
}

export function formatMarchandiseLabel(
  marchandise: Pick<Marchandise, "code" | "libelle">
): string {
  return `${marchandise.code} — ${marchandise.libelle}`;
}

export function marchandiseLabelFromLookup(
  marchandiseId: string,
  marchandisesById: ReadonlyMap<string, Pick<Marchandise, "code" | "libelle">>
): string {
  const marchandise = marchandisesById.get(marchandiseId);
  return marchandise
    ? formatMarchandiseLabel(marchandise)
    : marchandiseId;
}
