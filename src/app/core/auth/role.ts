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
