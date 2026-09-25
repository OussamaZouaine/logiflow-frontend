import type { Environment } from "./environment.types";

export const environment: Environment = {
  apiBaseUrl: "/api/v1",
  auth: {
    mode: "keycloak",
    authority: "http://localhost:8081/realms/logiflow",
    clientId: "logiflow-frontend",
    redirectUrl: "http://localhost:4200/connexion/retour",
    postLogoutRedirectUri: "http://localhost:4200/connexion",
    scope: "openid profile email",
  },
};
