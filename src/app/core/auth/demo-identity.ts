import type { Role } from "./role";

export const DEMO_PASSWORD = "demo";

export interface DemoIdentity {
  login: string;
  role: Role;
}

export const DEMO_IDENTITIES: readonly DemoIdentity[] = [
  { login: "admin", role: "ADMINISTRATEUR" },
  { login: "exploitant", role: "EXPLOITANT" },
  { login: "responsable", role: "RESPONSABLE_EXPLOITATION" },
  { login: "commercial", role: "COMMERCIAL" },
  { login: "atelier", role: "ATELIER" },
  { login: "chauffeur", role: "CHAUFFEUR" },
];

export function findDemoIdentity(login: string): DemoIdentity | undefined {
  const normalised = login.trim().toLowerCase();
  return DEMO_IDENTITIES.find((identity) => identity.login === normalised);
}
