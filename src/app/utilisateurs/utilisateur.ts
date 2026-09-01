import { ROLES, type Role, roleLabel } from "../core/auth/role";

export interface Utilisateur {
  actif: boolean;
  email: string;
  id: string;
  login: string;
  roles: Role[];
}

export interface UtilisateurWrite {
  email: string;
  login: string;
  roles: Role[];
}

export interface UtilisateurDraft {
  email: string;
  login: string;
  roles: Role[];
}

export const UTILISATEUR_ROLES = ROLES;

export function emptyUtilisateurDraft(): UtilisateurDraft {
  return {
    email: "",
    login: "",
    roles: ["EXPLOITANT"],
  };
}

export function utilisateurToDraft(utilisateur: Utilisateur): UtilisateurDraft {
  return {
    email: utilisateur.email,
    login: utilisateur.login,
    roles: [...utilisateur.roles],
  };
}

export function draftToWrite(draft: UtilisateurDraft): UtilisateurWrite {
  return {
    email: draft.email.trim(),
    login: draft.login.trim(),
    roles: draft.roles,
  };
}

export function formatRoles(roles: readonly Role[]): string {
  return roles.map((role) => roleLabel(role)).join(", ");
}

export function withToggledRole(
  draft: UtilisateurDraft,
  role: Role,
  checked: boolean
): UtilisateurDraft {
  const has = draft.roles.includes(role);
  if (checked && !has) {
    return { ...draft, roles: [...draft.roles, role] };
  }
  if (!checked && has) {
    return { ...draft, roles: draft.roles.filter((item) => item !== role) };
  }
  return draft;
}
