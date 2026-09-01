import { TestBed } from "@angular/core/testing";
import { DEMO_PASSWORD } from "./demo-identity";
import { DEMO_SESSION_STORAGE_KEY, DemoSessionService } from "./demo-session";

describe("DemoSessionService", () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  it("opens a session for a seeded identity", () => {
    const service = TestBed.inject(DemoSessionService);
    expect(service.signIn("admin", DEMO_PASSWORD)).toBe(true);
    expect(service.isSignedIn()).toBe(true);
    expect(service.session()?.login).toBe("admin");
    expect(service.hasAnyRole(["ADMINISTRATEUR"])).toBe(true);
    expect(sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY)).toContain("admin");
  });

  it("rejects a wrong password", () => {
    const service = TestBed.inject(DemoSessionService);
    expect(service.signIn("admin", "wrong")).toBe(false);
    expect(service.isSignedIn()).toBe(false);
  });

  it("normalises login case", () => {
    const service = TestBed.inject(DemoSessionService);
    expect(service.signIn("  EXPLOITANT  ", DEMO_PASSWORD)).toBe(true);
    expect(service.session()?.login).toBe("exploitant");
  });

  it("clears the session on sign-out", () => {
    const service = TestBed.inject(DemoSessionService);
    service.signIn("chauffeur", DEMO_PASSWORD);
    service.signOut();
    expect(service.isSignedIn()).toBe(false);
    expect(sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY)).toBeNull();
  });
});
