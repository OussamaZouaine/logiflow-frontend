import { DemoSessionService } from "./demo-session";
import { SessionUtilisateur } from "./session";

/** Providers pour les tests Vitest en mode démo. */
export const AUTH_DEMO_TEST_PROVIDERS = [
  DemoSessionService,
  { provide: SessionUtilisateur, useExisting: DemoSessionService },
];
