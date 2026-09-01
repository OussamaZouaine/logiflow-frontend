import { TestBed } from "@angular/core/testing";
import {
  type ActivatedRouteSnapshot,
  provideRouter,
  type RouterStateSnapshot,
} from "@angular/router";
import { DEMO_PASSWORD } from "./demo-identity";
import { DemoSessionService } from "./demo-session";
import { guestGuard, roleGuard, signedInGuard } from "./guards";
import { SITES_ALLOWED_ROLES } from "./role";

function emptyRoute(): ActivatedRouteSnapshot {
  return { data: {} } as unknown as ActivatedRouteSnapshot;
}

function sitesRoute(): ActivatedRouteSnapshot {
  return {
    data: { roles: SITES_ALLOWED_ROLES },
  } as unknown as ActivatedRouteSnapshot;
}

function routerState(): RouterStateSnapshot {
  return { url: "/" } as unknown as RouterStateSnapshot;
}

describe("auth guards", () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it("signedInGuard sends guests to /connexion", () => {
    const result = TestBed.runInInjectionContext(() =>
      signedInGuard(emptyRoute(), routerState())
    );
    expect(String(result)).toContain("/connexion");
  });

  it("signedInGuard allows a Demo Session", () => {
    TestBed.inject(DemoSessionService).signIn("admin", DEMO_PASSWORD);
    const result = TestBed.runInInjectionContext(() =>
      signedInGuard(emptyRoute(), routerState())
    );
    expect(result).toBe(true);
  });

  it("guestGuard sends a signed-in user to /", () => {
    TestBed.inject(DemoSessionService).signIn("admin", DEMO_PASSWORD);
    const result = TestBed.runInInjectionContext(() =>
      guestGuard(emptyRoute(), routerState())
    );
    expect(String(result)).toContain("/");
    expect(String(result)).not.toContain("/connexion");
  });

  it("roleGuard sends chauffeur to /403 for Sites", () => {
    TestBed.inject(DemoSessionService).signIn("chauffeur", DEMO_PASSWORD);
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(sitesRoute(), routerState())
    );
    expect(String(result)).toContain("/403");
  });

  it("roleGuard allows exploitant on Sites", () => {
    TestBed.inject(DemoSessionService).signIn("exploitant", DEMO_PASSWORD);
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(sitesRoute(), routerState())
    );
    expect(result).toBe(true);
  });
});
