export const ROLES = [
  "ADMINISTRATEUR",
  "RESPONSABLE_EXPLOITATION",
  "EXPLOITANT",
  "COMMERCIAL",
  "ATELIER",
  "CHAUFFEUR",
] as const;

export type Role = (typeof ROLES)[number];

export const SITES_ALLOWED_ROLES: readonly Role[] = [
  "ADMINISTRATEUR",
  "RESPONSABLE_EXPLOITATION",
  "EXPLOITANT",
  "COMMERCIAL",
];

/** Catalogue référentiel — same reach as Sites. */
export const MARCHANDISES_ALLOWED_ROLES = SITES_ALLOWED_ROLES;

/** Référentiel clients — same reach as Commandes. */
export const CLIENTS_ALLOWED_ROLES: readonly Role[] = [
  "ADMINISTRATEUR",
  "RESPONSABLE_EXPLOITATION",
  "EXPLOITANT",
  "COMMERCIAL",
];

/** Gestion des chauffeurs (fiches, habilitations, documents) — exploitation. */
export const CHAUFFEURS_ALLOWED_ROLES: readonly Role[] = [
  "ADMINISTRATEUR",
  "RESPONSABLE_EXPLOITATION",
  "EXPLOITANT",
];

/** Flotte semi-remorques — same reach as Véhicules. */
export const REMORQUES_ALLOWED_ROLES: readonly Role[] = [
  "ADMINISTRATEUR",
  "RESPONSABLE_EXPLOITATION",
  "EXPLOITANT",
  "ATELIER",
];

export const VOYAGES_PLAN_ROLES: readonly Role[] = [
  "ADMINISTRATEUR",
  "RESPONSABLE_EXPLOITATION",
  "EXPLOITANT",
];

/** List and detail on /voyages. */
export const VOYAGES_ALLOWED_ROLES: readonly Role[] = [
  ...VOYAGES_PLAN_ROLES,
  "CHAUFFEUR",
];

/** Prises de carburant — same reach as Voyages. */
export const CARBURANT_PRISES_ALLOWED_ROLES = VOYAGES_ALLOWED_ROLES;

/** Stations carburant — same reach as Sites. */
export const CARBURANT_STATIONS_ALLOWED_ROLES = SITES_ALLOWED_ROLES;

/** List and detail on /dossiers — same as Commandes. */
export const DOSSIERS_ALLOWED_ROLES: readonly Role[] = [
  "ADMINISTRATEUR",
  "RESPONSABLE_EXPLOITATION",
  "EXPLOITANT",
  "COMMERCIAL",
];

/** Create dossier and advance StatutDossier — same as voyage planning. */
export const DOSSIERS_PLAN_ROLES: readonly Role[] = VOYAGES_PLAN_ROLES;

export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" && (ROLES as readonly string[]).includes(value)
  );
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "ADMINISTRATEUR":
      return "Administrateur";
    case "RESPONSABLE_EXPLOITATION":
      return "Responsable d'exploitation";
    case "EXPLOITANT":
      return "Exploitant";
    case "COMMERCIAL":
      return "Commercial";
    case "ATELIER":
      return "Atelier";
    case "CHAUFFEUR":
      return "Chauffeur";
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}
