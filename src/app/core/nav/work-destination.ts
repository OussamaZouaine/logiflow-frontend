import { type Role, SITES_ALLOWED_ROLES } from "../auth/role";

export const WORK_DESTINATION_IDS = [
  "sites",
  "vehicules",
  "voyages",
  "maintenance",
  "commandes",
  "utilisateurs",
] as const;

export type WorkDestinationId = (typeof WORK_DESTINATION_IDS)[number];

export interface WorkDestination {
  apiHint: string;
  blurb: string;
  id: WorkDestinationId;
  label: string;
  live: boolean;
  path: string;
  roles: readonly Role[];
  section: string;
}

export const WORK_DESTINATIONS: Record<WorkDestinationId, WorkDestination> = {
  commandes: {
    apiHint: "/api/v1/commandes",
    blurb: "Demandes clients à transporter.",
    id: "commandes",
    label: "Commandes",
    live: true,
    path: "commandes",
    roles: [
      "ADMINISTRATEUR",
      "RESPONSABLE_EXPLOITATION",
      "EXPLOITANT",
      "COMMERCIAL",
    ],
    section: "Commercial",
  },
  maintenance: {
    apiHint: "/api/v1/ordres-travail",
    blurb: "Ordres de travail et plans d'entretien.",
    id: "maintenance",
    label: "Maintenance",
    live: true,
    path: "maintenance",
    roles: ["ADMINISTRATEUR", "RESPONSABLE_EXPLOITATION", "ATELIER"],
    section: "Atelier",
  },
  sites: {
    apiHint: "/api/v1/sites",
    blurb: "Quais de chargement et de déchargement.",
    id: "sites",
    label: "Sites",
    live: true,
    path: "sites",
    roles: SITES_ALLOWED_ROLES,
    section: "Référentiel",
  },
  utilisateurs: {
    apiHint: "/api/v1/utilisateurs",
    blurb: "Provisioning des comptes.",
    id: "utilisateurs",
    label: "Utilisateurs",
    live: true,
    path: "utilisateurs",
    roles: ["ADMINISTRATEUR"],
    section: "IAM",
  },
  vehicules: {
    apiHint: "/api/v1/vehicules",
    blurb: "Parc, documents, compteurs.",
    id: "vehicules",
    label: "Véhicules",
    live: true,
    path: "vehicules",
    roles: [
      "ADMINISTRATEUR",
      "RESPONSABLE_EXPLOITATION",
      "EXPLOITANT",
      "ATELIER",
    ],
    section: "Flotte",
  },
  voyages: {
    apiHint: "/api/v1/voyages",
    blurb: "Exécution physique des dossiers.",
    id: "voyages",
    label: "Voyages",
    live: true,
    path: "voyages",
    roles: [
      "ADMINISTRATEUR",
      "RESPONSABLE_EXPLOITATION",
      "EXPLOITANT",
      "CHAUFFEUR",
    ],
    section: "Planning",
  },
};

export function workDestination(id: WorkDestinationId): WorkDestination {
  return WORK_DESTINATIONS[id];
}

export function destinationsForRoles(
  roles: readonly Role[]
): WorkDestination[] {
  return WORK_DESTINATION_IDS.map((id) => WORK_DESTINATIONS[id]).filter(
    (destination) => roles.some((role) => destination.roles.includes(role))
  );
}
