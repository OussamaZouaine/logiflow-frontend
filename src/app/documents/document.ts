export const TYPE_ENTITES_DOCUMENTABLES = [
  "VEHICULE",
  "REMORQUE",
  "CHAUFFEUR",
] as const;
export type TypeEntiteDocumentable =
  (typeof TYPE_ENTITES_DOCUMENTABLES)[number];

export const DOCUMENT_TYPES = [
  "CARTE_GRISE",
  "ASSURANCE",
  "CONTROLE_TECHNIQUE",
  "ADR",
  "PHOTO",
  "AUTRE",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

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
