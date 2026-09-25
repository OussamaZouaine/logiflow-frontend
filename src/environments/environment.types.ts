export type AuthMode = "demo" | "keycloak";

export interface DemoAuthConfig {
  mode: "demo";
}

export interface KeycloakAuthConfig {
  mode: "keycloak";
  authority: string;
  clientId: string;
  redirectUrl: string;
  postLogoutRedirectUri: string;
  scope: string;
}

export type AuthConfig = DemoAuthConfig | KeycloakAuthConfig;

export interface Environment {
  apiBaseUrl: string;
  auth: AuthConfig;
}
