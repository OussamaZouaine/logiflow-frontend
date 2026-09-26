import type { AuthConfig, Environment } from "./environment.types";

/**
 * Configuration de déploiement, lue au démarrage depuis `/config.js` (généré par le conteneur
 * nginx à partir de ses variables d'environnement, voir docker/40-logiflow-config.sh). Une même
 * image sert ainsi tous les environnements : aucune URL n'est figée au build.
 */
interface ConfigExecution {
  authMode?: "demo" | "keycloak";
  keycloakClientId?: string;
  keycloakRealm?: string;
  keycloakUrl?: string;
}

const config: ConfigExecution =
  (globalThis as { __LOGIFLOW_CONFIG__?: ConfigExecution })
    .__LOGIFLOW_CONFIG__ ?? {};

const BARRES_FINALES = /\/+$/;

function authDepuisConfig(): AuthConfig {
  if (config.authMode !== "keycloak" || !config.keycloakUrl) {
    return { mode: "demo" };
  }
  const origine = globalThis.location.origin;
  const url = config.keycloakUrl.replace(BARRES_FINALES, "");
  return {
    authority: `${url}/realms/${config.keycloakRealm ?? "logiflow"}`,
    clientId: config.keycloakClientId ?? "logiflow-frontend",
    mode: "keycloak",
    postLogoutRedirectUri: `${origine}/connexion`,
    redirectUrl: `${origine}/connexion/retour`,
    scope: "openid profile email",
  };
}

export const environment: Environment = {
  apiBaseUrl: "/api/v1",
  auth: authDepuisConfig(),
};
