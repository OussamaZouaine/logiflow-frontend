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
  | "sinistre"
  | "prestataire"
  | "contratAssurance"
  | "scoreSante"
  | "utilisateur";

export interface ApiEntityRelation {
  /** OpenAPI schema or controller tag */
  entity: ApiEntityId;
  /** Human label for UI sections */
  label: string;
  /** Outgoing references declared on responses or create payloads */
  references: ReadonlyArray<{
    field: string;
    target: ApiEntityId;
    kind: "fk" | "via" | "derived";
    notes?: string;
  }>;
  /** Primary list/detail routes in the Angular app (when they exist) */
  routes?: { list?: string; detail?: string; create?: string };
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
    references: [
      { field: "clientId", kind: "fk", target: "client" },
      { field: "lignes[].marchandiseId", kind: "fk", target: "marchandise" },
    ],
    routes: {
      create: "/commandes/nouveau",
      detail: "/commandes/:id",
      list: "/commandes",
    },
  },
  {
    entity: "dossier",
    label: "Dossier de transport",
    references: [
      { field: "commandeId", kind: "fk", target: "commande" },
      { field: "segments[].siteId", kind: "fk", target: "site" },
      {
        field: "lignesMarchandise[].marchandiseId",
        kind: "fk",
        target: "marchandise",
      },
      {
        field: "statut PLANIFIE",
        kind: "derived",
        notes: "Set when attached to a voyage; revert on voyage ANNULE",
        target: "voyage",
      },
    ],
    routes: {
      create: "/dossiers/nouveau",
      detail: "/dossiers/:id",
      list: "/dossiers",
    },
  },
  {
    entity: "voyage",
    label: "Voyage",
    references: [
      { field: "dossierIds[]", kind: "fk", target: "dossier" },
      { field: "vehiculeId", kind: "fk", target: "vehicule" },
      {
        field: "remorqueId",
        kind: "fk",
        notes: "optional",
        target: "remorque",
      },
      { field: "affectations[].chauffeurId", kind: "fk", target: "chauffeur" },
    ],
    routes: {
      create: "/voyages/nouveau",
      detail: "/voyages/:id",
      list: "/voyages",
    },
  },
  {
    entity: "vehicule",
    label: "Véhicule",
    references: [
      {
        field: "documents",
        kind: "via",
        notes: "GET /documents?typeEntite=VEHICULE&entiteId=",
        target: "document",
      },
      {
        field: "plans",
        kind: "fk",
        notes: "vehiculeId",
        target: "planEntretien",
      },
      {
        field: "ordres",
        kind: "fk",
        notes: "vehiculeId",
        target: "ordreTravail",
      },
      {
        field: "scores",
        kind: "fk",
        notes: "vehiculeId",
        target: "scoreSante",
      },
    ],
    routes: {
      detail: "/vehicules/:id",
      list: "/vehicules",
    },
  },
  {
    entity: "remorque",
    label: "Remorque",
    references: [
      {
        field: "documents",
        kind: "via",
        notes: "GET /documents?typeEntite=REMORQUE&entiteId=",
        target: "document",
      },
    ],
    routes: {
      detail: "/remorques/:id",
      list: "/remorques",
    },
  },
  {
    entity: "chauffeur",
    label: "Chauffeur",
    references: [
      {
        field: "documents",
        kind: "via",
        notes: "GET /documents?typeEntite=CHAUFFEUR&entiteId=",
        target: "document",
      },
      {
        field: "affectations",
        kind: "fk",
        notes: "Embedded on VoyageResponse (TITULAIRE + RENFORT)",
        target: "voyage",
      },
    ],
    routes: {
      create: "/chauffeurs/nouveau",
      detail: "/chauffeurs/:id",
      list: "/chauffeurs",
    },
  },
  {
    entity: "site",
    label: "Site",
    references: [
      { field: "clientId", kind: "fk", notes: "optional", target: "client" },
    ],
    routes: { detail: "/sites/:id", list: "/sites" },
  },
  {
    entity: "marchandise",
    label: "Marchandise",
    references: [],
    routes: {
      detail: "/marchandises/:id",
      list: "/marchandises",
    },
  },
  {
    entity: "planEntretien",
    label: "Plan d'entretien",
    references: [
      {
        field: "engin",
        kind: "fk",
        notes: "Véhicule ou remorque",
        target: "vehicule",
      },
      { field: "prestataireId", kind: "fk", target: "prestataire" },
      {
        field: "derniereRealisation",
        kind: "derived",
        notes: "Mise à jour à la clôture d'un OT lié (planId)",
        target: "ordreTravail",
      },
    ],
    routes: {
      create: "/maintenance/plans/nouveau",
      detail: "/maintenance/plans/:id",
      list: "/maintenance/plans",
    },
  },
  {
    entity: "ordreTravail",
    label: "Ordre de travail",
    references: [
      {
        field: "engin",
        kind: "fk",
        notes: "Véhicule ou remorque",
        target: "vehicule",
      },
      { field: "planId", kind: "fk", target: "planEntretien" },
      { field: "sinistreId", kind: "fk", target: "sinistre" },
      { field: "prestataireId", kind: "fk", target: "prestataire" },
    ],
    routes: {
      create: "/maintenance/ordres-travail/nouveau",
      detail: "/maintenance/ordres-travail/:id",
      list: "/maintenance/ordres-travail",
    },
  },
  {
    entity: "sinistre",
    label: "Sinistre",
    references: [
      { field: "vehiculeId", kind: "fk", target: "vehicule" },
      { field: "remorqueId", kind: "fk", target: "remorque" },
      { field: "chauffeurId", kind: "fk", target: "chauffeur" },
      { field: "voyageId", kind: "fk", target: "voyage" },
      { field: "contratId", kind: "fk", target: "contratAssurance" },
    ],
    routes: {
      create: "/maintenance/sinistres/nouveau",
      detail: "/maintenance/sinistres/:id",
      list: "/maintenance/sinistres",
    },
  },
  {
    entity: "prestataire",
    label: "Prestataire",
    references: [],
    routes: {
      create: "/maintenance/prestataires/nouveau",
      detail: "/maintenance/prestataires/:id",
      list: "/maintenance/prestataires",
    },
  },
  {
    entity: "contratAssurance",
    label: "Contrat d'assurance",
    references: [{ field: "assureurId", kind: "fk", target: "prestataire" }],
    routes: {
      create: "/maintenance/contrats/nouveau",
      detail: "/maintenance/contrats/:id",
      list: "/maintenance/contrats",
    },
  },
  {
    entity: "scoreSante",
    label: "Score de santé",
    references: [
      { field: "vehiculeId", kind: "fk", target: "vehicule" },
      {
        field: "statut",
        kind: "derived",
        notes: "StatutSante derived from score + kmAvantEcheance on POST",
        target: "vehicule",
      },
    ],
  },
  {
    entity: "document",
    label: "Document",
    references: [
      {
        field: "typeEntite + entiteId",
        kind: "via",
        notes: "Also REMORQUE, CHAUFFEUR",
        target: "vehicule",
      },
    ],
  },
] as const;

export function entityRelation(id: ApiEntityId): ApiEntityRelation | undefined {
  return API_ENTITY_GRAPH.find((entry) => entry.entity === id);
}
