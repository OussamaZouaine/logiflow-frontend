// Configuration de déploiement (lue par src/environments/environment.runtime.ts).
// En conteneur, ce fichier est régénéré au démarrage à partir des variables d'environnement
// (AUTH_MODE, KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID) : voir docker/40-logiflow-config.sh.
// Valeur par défaut : mode démo. Ignoré par `pnpm start` (environnement de développement).
window.__LOGIFLOW_CONFIG__ = { authMode: "demo" };
