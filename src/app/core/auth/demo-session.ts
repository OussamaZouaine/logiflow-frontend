import { computed, Service, signal } from "@angular/core";
import { DEMO_PASSWORD, findDemoIdentity } from "./demo-identity";
import { isRole, type Role } from "./role";

export const DEMO_SESSION_STORAGE_KEY = "logiflow.demo-session";

export interface DemoSession {
  login: string;
  roles: readonly Role[];
}

@Service()
export class DemoSessionService {
  readonly session = signal<DemoSession | null>(readStoredSession());
  readonly isSignedIn = computed(() => this.session() !== null);

  signIn(login: string, password: string): boolean {
    const identity = findDemoIdentity(login);
    if (!identity || password !== DEMO_PASSWORD) {
      return false;
    }

    const session: DemoSession = {
      login: identity.login,
      roles: [identity.role],
    };
    persistSession(session);
    this.session.set(session);
    return true;
  }

  signOut(): void {
    clearStoredSession();
    this.session.set(null);
  }

  hasAnyRole(roles: readonly Role[]): boolean {
    const current = this.session();
    if (!current) {
      return false;
    }
    return roles.some((role) => current.roles.includes(role));
  }
}

function readStoredSession(): DemoSession | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("login" in parsed) ||
      !("roles" in parsed)
    ) {
      clearStoredSession();
      return null;
    }

    const { login, roles } = parsed;
    if (typeof login !== "string" || !Array.isArray(roles)) {
      clearStoredSession();
      return null;
    }

    const validRoles = roles.filter(isRole);
    if (validRoles.length === 0) {
      clearStoredSession();
      return null;
    }

    return { login, roles: validRoles };
  } catch {
    clearStoredSession();
    return null;
  }
}

function persistSession(session: DemoSession): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
}
