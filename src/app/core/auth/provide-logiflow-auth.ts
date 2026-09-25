import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import {
  inject,
  type EnvironmentProviders,
  makeEnvironmentProviders,
  provideAppInitializer,
} from "@angular/core";
import {
  authInterceptor,
  LogLevel,
  OidcSecurityService,
  provideAuth,
} from "angular-auth-oidc-client";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthSyncService } from "./auth-sync";
import { apiErrorInterceptor } from "./api-error.interceptor";
import { DemoSessionService } from "./demo-session";
import { KeycloakSessionService } from "./keycloak-session";
import { SessionUtilisateur } from "./session";

export function provideLogiflowAuth(): EnvironmentProviders {
  const mode = environment.auth.mode;

  const sessionProvider =
    mode === "keycloak"
      ? [
          KeycloakSessionService,
          { provide: SessionUtilisateur, useExisting: KeycloakSessionService },
        ]
      : [
          DemoSessionService,
          { provide: SessionUtilisateur, useExisting: DemoSessionService },
        ];

  const httpProviders =
    mode === "keycloak"
      ? [
          provideHttpClient(
            withFetch(),
            withInterceptors([authInterceptor(), apiErrorInterceptor])
          ),
        ]
      : [provideHttpClient(withFetch())];

  const oidcProviders =
    mode === "keycloak" && environment.auth.mode === "keycloak"
      ? [
          provideAuth({
            config: {
              authority: environment.auth.authority,
              clientId: environment.auth.clientId,
              redirectUrl: environment.auth.redirectUrl,
              postLogoutRedirectUri: environment.auth.postLogoutRedirectUri,
              scope: environment.auth.scope,
              responseType: "code",
              silentRenew: true,
              useRefreshToken: true,
              renewTimeBeforeTokenExpiresInSeconds: 30,
              secureRoutes: ["/api/"],
              logLevel: LogLevel.Warn,
            },
          }),
          provideAppInitializer(() => {
            const oidc = inject(OidcSecurityService);
            return firstValueFrom(oidc.checkAuth());
          }),
        ]
      : [];

  return makeEnvironmentProviders([
    ...sessionProvider,
    ...httpProviders,
    ...oidcProviders,
    provideAppInitializer(() => {
      inject(AuthSyncService).init();
    }),
  ]);
}
