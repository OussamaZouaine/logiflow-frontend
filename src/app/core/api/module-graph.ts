/**
 * Entity relationships from LogiFlow OpenAPI (`api-docs.json`).
 * Use this to wire fiche cross-links and to avoid inventing couplings the API
 * does not expose.
 *
 * Legend:
 * - `fk` = foreign key on the child payload or query param
 * - `via` = separate module / polymorphic attachment (no DB FK in API)
 * - `derived` = computed server-side, not stored as a link
 */

export type ApiEntityId =
  | "client"
  | "commande"
  | "dossier"
  | "voyage"
  | "vehicule"
  | "remorque"
  | "chauffeur"
  | "site"
  | "marchandise"
  | "document"
  | "planEntretien"
  | "ordreTravail"
  | "scoreSante"
  | "utilisateur";

export interface ApiEntityRelation {
  /** OpenAPI schema or controller tag */
  entity: ApiEntityId;
  /** Human label for UI sections */
  label: string;
  /** Primary list/detail routes in the Angular app (when they exist) */
  routes?: { list?: string; detail?: string; create?: string };
  /** Outgoing references declared on responses or create payloads */
  references: ReadonlyArray<{
    field: string;
    target: ApiEntityId;
    kind: "fk" | "via" | "derived";
    notes?: string;
  }>;
}

/** Commercial → exploitation chain (Commande → Dossier → Voyage). */
export const API_ENTITY_GRAPH: readonly ApiEntityRelation[] = [
  {
    entity: "client",
    label: "Client",
    references: [],
  },
  {
    entity: "commande",
    label: "Commande",
    routes: {
      list: "/commandes",
      detail: "/commandes/:id",
      create: "/commandes/nouveau",
    },
    references: [
      { field: "clientId", target: "client", kind: "fk" },
      { field: "lignes[].marchandiseId", target: "marchandise", kind: "fk" },
    ],
  },
  {
    entity: "dossier",
    label: "Dossier de transport",
    routes: {
      list: "/dossiers",
      detail: "/dossiers/:id",
      create: "/dossiers/nouveau",
    },
    references: [
      { field: "commandeId", target: "commande", kind: "fk" },
      { field: "segments[].siteId", target: "site", kind: "fk" },
      { field: "lignesMarchandise[].marchandiseId", target: "marchandise", kind: "fk" },
      {
        field: "statut PLANIFIE",
        target: "voyage",
        kind: "derived",
        notes: "Set when attached to a voyage; revert on voyage ANNULE",
      },
    ],
  },
  {
    entity: "voyage",
    label: "Voyage",
    routes: {
      list: "/voyages",
      detail: "/voyages/:id",
      create: "/voyages/nouveau",
    },
    references: [
      { field: "dossierIds[]", target: "dossier", kind: "fk" },
      { field: "vehiculeId", target: "vehicule", kind: "fk" },
      { field: "remorqueId", target: "remorque", kind: "fk", notes: "optional" },
      { field: "affectations[].chauffeurId", target: "chauffeur", kind: "fk" },
    ],
  },
  {
    entity: "vehicule",
    label: "Véhicule",
    routes: {
      list: "/vehicules",
      detail: "/vehicules/:id",
    },
    references: [
      {
        field: "documents",
        target: "document",
        kind: "via",
        notes: "GET /documents?typeEntite=VEHICULE&entiteId=",
      },
      { field: "plans", target: "planEntretien", kind: "fk", notes: "vehiculeId" },
      { field: "ordres", target: "ordreTravail", kind: "fk", notes: "vehiculeId" },
      { field: "scores", target: "scoreSante", kind: "fk", notes: "vehiculeId" },
    ],
  },
  {
    entity: "remorque",
    label: "Remorque",
    routes: {
      list: "/remorques",
      detail: "/remorques/:id",
    },
    references: [
      {
        field: "documents",
        target: "document",
        kind: "via",
        notes: "GET /documents?typeEntite=REMORQUE&entiteId=",
      },
    ],
  },
  {
    entity: "chauffeur",
    label: "Chauffeur",
    references: [
      {
        field: "documents",
        target: "document",
        kind: "via",
        notes: "GET /documents?typeEntite=CHAUFFEUR&entiteId=",
      },
      {
        field: "affectations",
        target: "voyage",
        kind: "fk",
        notes: "Embedded on VoyageResponse; no /chauffeurs module in v1 UI",
      },
    ],
  },
  {
    entity: "site",
    label: "Site",
    routes: { list: "/sites", detail: "/sites/:id" },
    references: [
      { field: "clientId", target: "client", kind: "fk", notes: "optional" },
    ],
  },
  {
    entity: "marchandise",
    label: "Marchandise",
    routes: {
      list: "/marchandises",
      detail: "/marchandises/:id",
    },
    references: [],
  },
  {
    entity: "planEntretien",
    label: "Plan d'entretien",
    routes: {
      list: "/maintenance/plans",
      detail: "/maintenance/plans/:id",
      create: "/maintenance/plans/nouveau",
    },
    references: [
      { field: "vehiculeId", target: "vehicule", kind: "fk" },
      {
        field: "ordreTravail",
        target: "ordreTravail",
        kind: "derived",
        notes: "Not linked in API — schedule vs execution are separate",
      },
    ],
  },
  {
    entity: "ordreTravail",
    label: "Ordre de travail",
    routes: {
      list: "/maintenance",
      detail: "/maintenance/:id",
      create: "/maintenance/nouveau",
    },
    references: [{ field: "vehiculeId", target: "vehicule", kind: "fk" }],
  },
  {
    entity: "scoreSante",
    label: "Score de santé",
    references: [
      { field: "vehiculeId", target: "vehicule", kind: "fk" },
      {
        field: "statut",
        target: "vehicule",
        kind: "derived",
        notes: "StatutSante derived from score + kmAvantEcheance on POST",
      },
    ],
  },
  {
    entity: "document",
    label: "Document",
    references: [
      {
        field: "typeEntite + entiteId",
        target: "vehicule",
        kind: "via",
        notes: "Also REMORQUE, CHAUFFEUR",
      },
    ],
  },
] as const;

export function entityRelation(
  id: ApiEntityId
): ApiEntityRelation | undefined {
  return API_ENTITY_GRAPH.find((entry) => entry.entity === id);
}
