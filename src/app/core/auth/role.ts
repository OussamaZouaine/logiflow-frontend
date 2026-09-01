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
