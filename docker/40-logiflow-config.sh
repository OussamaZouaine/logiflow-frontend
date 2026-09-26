#!/bin/sh
# Génère /config.js au démarrage du conteneur à partir des variables d'environnement, pour qu'une
# même image serve tous les environnements (exécuté par l'entrypoint de l'image nginx officielle).
#
#   AUTH_MODE           demo | keycloak                       (défaut : demo)
#   KEYCLOAK_URL        URL publique de Keycloak, ex. https://auth.exemple.fr
#   KEYCLOAK_REALM      realm                                  (défaut : logiflow)
#   KEYCLOAK_CLIENT_ID  client OIDC public                     (défaut : logiflow-frontend)
set -eu

CIBLE=/usr/share/nginx/html/config.js

cat > "$CIBLE" <<EOF
window.__LOGIFLOW_CONFIG__ = {
  authMode: "${AUTH_MODE:-demo}",
  keycloakUrl: "${KEYCLOAK_URL:-}",
  keycloakRealm: "${KEYCLOAK_REALM:-logiflow}",
  keycloakClientId: "${KEYCLOAK_CLIENT_ID:-logiflow-frontend}"
};
EOF

echo "logiflow: config.js généré (authMode=${AUTH_MODE:-demo}, keycloak=${KEYCLOAK_URL:-aucun})"
