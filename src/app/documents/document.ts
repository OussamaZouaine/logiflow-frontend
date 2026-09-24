export const TYPE_ENTITES_DOCUMENTABLES = [
  "VEHICULE",
  "REMORQUE",
  "CHAUFFEUR",
  "PRISE_CARBURANT",
] as const;
export type TypeEntiteDocumentable =
  (typeof TYPE_ENTITES_DOCUMENTABLES)[number];

export const DOCUMENT_TYPES = [
  "CARTE_GRISE",
  "ASSURANCE",
  "CONTROLE_TECHNIQUE",
  "ADR",
  "PHOTO",
  "JUSTIFICATIF_CARBURANT",
  "PERMIS_CONDUIRE",
  "CARTE_CONDUCTEUR",
  "FIMO_FCO",
  "VISITE_MEDICALE",
  "PIECE_IDENTITE",
  "PASSEPORT",
  "VISA",
  "AUTRE",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/** Types proposés au téléversement selon l'entité (tous restent acceptés par l'API). */
export const DOCUMENT_TYPES_PAR_ENTITE: Record<
  TypeEntiteDocumentable,
  readonly DocumentType[]
> = {
  CHAUFFEUR: [
    "PERMIS_CONDUIRE",
    "CARTE_CONDUCTEUR",
    "FIMO_FCO",
    "VISITE_MEDICALE",
    "ADR",
    "PIECE_IDENTITE",
    "PASSEPORT",
    "VISA",
    "PHOTO",
    "AUTRE",
  ],
  PRISE_CARBURANT: ["JUSTIFICATIF_CARBURANT", "PHOTO", "AUTRE"],
  REMORQUE: [
    "CARTE_GRISE",
    "ASSURANCE",
    "CONTROLE_TECHNIQUE",
    "ADR",
    "PHOTO",
    "AUTRE",
  ],
  VEHICULE: [
    "CARTE_GRISE",
    "ASSURANCE",
    "CONTROLE_TECHNIQUE",
    "ADR",
    "PHOTO",
    "AUTRE",
  ],
};

export interface Document {
  dateExpiration: string | null;
  entiteId: string;
  id: string;
  reference: string;
  typeDocument: DocumentType;
  typeEntite: TypeEntiteDocumentable;
  url: string;
}

export interface DocumentUploadDraft {
  dateExpiration: string;
  reference: string;
  typeDocument: DocumentType;
}

export function emptyDocumentUploadDraft(): DocumentUploadDraft {
  return {
    dateExpiration: "",
    reference: "",
    typeDocument: "CARTE_GRISE",
  };
}

export function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
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
    case "PHOTO":
      return "Photo";
    case "JUSTIFICATIF_CARBURANT":
      return "Justificatif carburant";
    case "PERMIS_CONDUIRE":
      return "Permis de conduire";
    case "CARTE_CONDUCTEUR":
      return "Carte conducteur";
    case "FIMO_FCO":
      return "FIMO / FCO";
    case "VISITE_MEDICALE":
      return "Visite médicale";
    case "PIECE_IDENTITE":
      return "Pièce d'identité";
    case "PASSEPORT":
      return "Passeport";
    case "VISA":
      return "Visa";
    case "AUTRE":
      return "Autre";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function formatDocumentExpiration(value: string | null): string {
  if (!value) {
    return "—";
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("fr-FR");
}
