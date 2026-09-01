import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";
import { DemoSessionService } from "./demo-session";
import { isRole, type Role } from "./role";

export const signedInGuard: CanActivateFn = () => {
  const session = inject(DemoSessionService);
  const router = inject(Router);
  if (session.isSignedIn()) {
    return true;
  }
  return router.parseUrl("/connexion");
};

export const guestGuard: CanActivateFn = () => {
  const session = inject(DemoSessionService);
  const router = inject(Router);
  if (!session.isSignedIn()) {
    return true;
  }
  return router.parseUrl("/");
};

export const roleGuard: CanActivateFn = (route) => {
  const session = inject(DemoSessionService);
  const router = inject(Router);
  const { roles } = route.data;
  const allowed = readAllowedRoles(roles);
  if (allowed.length === 0 || session.hasAnyRole(allowed)) {
    return true;
  }
  return router.parseUrl("/403");
};

function readAllowedRoles(value: unknown): Role[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRole);
}
