import type { WorkDestinationId } from "./work-destination";

/** Lucide icon names registered on the App Shell for each work destination. */
export const DESTINATION_NAV_ICON: Record<WorkDestinationId, string> = {
  carburant: "lucideFuel",
  chauffeurs: "lucideIdCard",
  clients: "lucideBuilding2",
  commandes: "lucideClipboardList",
  dossiers: "lucideFolderOpen",
  maintenance: "lucideWrench",
  marchandises: "lucidePackage",
  remorques: "lucideContainer",
  sites: "lucideMapPin",
  utilisateurs: "lucideUsers",
  vehicules: "lucideTruck",
  voyages: "lucideRoute",
};

export const TABLEAU_NAV_ICON = "lucideLayoutDashboard";
