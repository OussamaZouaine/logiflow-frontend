import type { Routes } from "@angular/router";
import { guestGuard, roleGuard, signedInGuard } from "./core/auth/guards";
import {
  CARBURANT_STATIONS_ALLOWED_ROLES,
  DOSSIERS_PLAN_ROLES,
} from "./core/auth/role";
import { shellBreadcrumb } from "./core/nav/shell-breadcrumb-data";
import { workDestination } from "./core/nav/work-destination";

/** Fil d'Ariane d'une section du module maintenance (Maintenance › section). */
function maintenanceTrail(label: string, path: string) {
  return [
    { label: "Maintenance", path: "/maintenance" },
    { label, path },
  ] as const;
}

const carburantStationsTrail = [
  { label: "Carburant", path: "/carburant" },
  { label: "Stations", path: "/carburant/stations" },
] as const;

export const routes: Routes = [
  {
    canActivate: [guestGuard],
    loadComponent: () =>
      import("./auth/sign-in-page").then((module) => module.SignInPage),
    path: "connexion",
  },
  {
    canActivate: [signedInGuard],
    children: [
      {
        data: { ...shellBreadcrumb.list("Tableau de bord") },
        loadComponent: () =>
          import("./tableau/tableau-de-bord-page").then(
            (module) => module.TableauDeBordPage
          ),
        path: "",
        pathMatch: "full",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("sites").roles,
          ...shellBreadcrumb.list("Sites"),
        },
        loadComponent: () =>
          import("./sites/sites-page").then((module) => module.SitesPage),
        path: "sites",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("sites").roles,
          ...shellBreadcrumb.create("Sites", "/sites"),
        },
        loadComponent: () =>
          import("./sites/site-create-page").then(
            (module) => module.SiteCreatePage
          ),
        path: "sites/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("sites").roles,
          ...shellBreadcrumb.detail("Sites", "/sites"),
        },
        loadComponent: () =>
          import("./sites/site-detail-page").then(
            (module) => module.SiteDetailPage
          ),
        path: "sites/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("marchandises").roles,
          ...shellBreadcrumb.list("Marchandises"),
        },
        loadComponent: () =>
          import("./marchandises/marchandises-page").then(
            (module) => module.MarchandisesPage
          ),
        path: "marchandises",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("marchandises").roles,
          ...shellBreadcrumb.create("Marchandises", "/marchandises"),
        },
        loadComponent: () =>
          import("./marchandises/marchandise-create-page").then(
            (module) => module.MarchandiseCreatePage
          ),
        path: "marchandises/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("marchandises").roles,
          ...shellBreadcrumb.detail("Marchandises", "/marchandises"),
        },
        loadComponent: () =>
          import("./marchandises/marchandise-detail-page").then(
            (module) => module.MarchandiseDetailPage
          ),
        path: "marchandises/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("vehicules").roles,
          ...shellBreadcrumb.list("Véhicules"),
        },
        loadComponent: () =>
          import("./vehicules/vehicules-page").then(
            (module) => module.VehiculesPage
          ),
        path: "vehicules",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("vehicules").roles,
          ...shellBreadcrumb.create("Véhicules", "/vehicules"),
        },
        loadComponent: () =>
          import("./vehicules/vehicule-create-page").then(
            (module) => module.VehiculeCreatePage
          ),
        path: "vehicules/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("vehicules").roles,
          ...shellBreadcrumb.detail("Véhicules", "/vehicules"),
        },
        loadComponent: () =>
          import("./vehicules/vehicule-detail-page").then(
            (module) => module.VehiculeDetailPage
          ),
        path: "vehicules/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("chauffeurs").roles,
          ...shellBreadcrumb.list("Chauffeurs"),
        },
        loadComponent: () =>
          import("./chauffeurs/chauffeurs-page").then(
            (module) => module.ChauffeursPage
          ),
        path: "chauffeurs",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("chauffeurs").roles,
          ...shellBreadcrumb.create("Chauffeurs", "/chauffeurs"),
        },
        loadComponent: () =>
          import("./chauffeurs/chauffeur-form-page").then(
            (module) => module.ChauffeurFormPage
          ),
        path: "chauffeurs/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("chauffeurs").roles,
          ...shellBreadcrumb.nested("Chauffeurs", "/chauffeurs", "Modifier"),
        },
        loadComponent: () =>
          import("./chauffeurs/chauffeur-form-page").then(
            (module) => module.ChauffeurFormPage
          ),
        path: "chauffeurs/:id/modifier",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("chauffeurs").roles,
          ...shellBreadcrumb.detail("Chauffeurs", "/chauffeurs"),
        },
        loadComponent: () =>
          import("./chauffeurs/chauffeur-detail-page").then(
            (module) => module.ChauffeurDetailPage
          ),
        path: "chauffeurs/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("remorques").roles,
          ...shellBreadcrumb.list("Remorques"),
        },
        loadComponent: () =>
          import("./remorques/remorques-page").then(
            (module) => module.RemorquesPage
          ),
        path: "remorques",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("remorques").roles,
          ...shellBreadcrumb.create("Remorques", "/remorques"),
        },
        loadComponent: () =>
          import("./remorques/remorque-create-page").then(
            (module) => module.RemorqueCreatePage
          ),
        path: "remorques/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("remorques").roles,
          ...shellBreadcrumb.detail("Remorques", "/remorques"),
        },
        loadComponent: () =>
          import("./remorques/remorque-detail-page").then(
            (module) => module.RemorqueDetailPage
          ),
        path: "remorques/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("voyages").roles,
          ...shellBreadcrumb.list("Voyages"),
        },
        loadComponent: () =>
          import("./voyages/voyages-page").then((module) => module.VoyagesPage),
        path: "voyages",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("voyages").roles,
          ...shellBreadcrumb.create("Voyages", "/voyages"),
        },
        loadComponent: () =>
          import("./voyages/voyage-create-page").then(
            (module) => module.VoyageCreatePage
          ),
        path: "voyages/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("voyages").roles,
          ...shellBreadcrumb.detail("Voyages", "/voyages"),
        },
        loadComponent: () =>
          import("./voyages/voyage-detail-page").then(
            (module) => module.VoyageDetailPage
          ),
        path: "voyages/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("carburant").roles,
          ...shellBreadcrumb.list("Carburant"),
        },
        loadComponent: () =>
          import("./carburant/prises-carburant-page").then(
            (module) => module.PrisesCarburantPage
          ),
        path: "carburant",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("carburant").roles,
          ...shellBreadcrumb.create("Carburant", "/carburant"),
        },
        loadComponent: () =>
          import("./carburant/prise-create-page").then(
            (module) => module.PriseCreatePage
          ),
        path: "carburant/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: CARBURANT_STATIONS_ALLOWED_ROLES,
          ...shellBreadcrumb.nested("Carburant", "/carburant", "Stations"),
        },
        loadComponent: () =>
          import("./carburant/stations-page").then(
            (module) => module.StationsPage
          ),
        path: "carburant/stations",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: CARBURANT_STATIONS_ALLOWED_ROLES,
          ...shellBreadcrumb.createNested([...carburantStationsTrail]),
        },
        loadComponent: () =>
          import("./carburant/station-create-page").then(
            (module) => module.StationCreatePage
          ),
        path: "carburant/stations/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: CARBURANT_STATIONS_ALLOWED_ROLES,
          ...shellBreadcrumb.detailNested([...carburantStationsTrail]),
        },
        loadComponent: () =>
          import("./carburant/station-detail-page").then(
            (module) => module.StationDetailPage
          ),
        path: "carburant/stations/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("carburant").roles,
          ...shellBreadcrumb.detail("Carburant", "/carburant"),
        },
        loadComponent: () =>
          import("./carburant/prise-detail-page").then(
            (module) => module.PriseDetailPage
          ),
        path: "carburant/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.list("Maintenance"),
        },
        loadComponent: () =>
          import("./maintenance/maintenance-dashboard-page").then(
            (module) => module.MaintenanceDashboardPage
          ),
        path: "maintenance",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.nested(
            "Maintenance",
            "/maintenance",
            "Ordres de travail"
          ),
        },
        loadComponent: () =>
          import("./maintenance/ordres-travail-page").then(
            (module) => module.OrdresTravailPage
          ),
        path: "maintenance/ordres-travail",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.createNested(
            maintenanceTrail("Ordres de travail", "/maintenance/ordres-travail")
          ),
        },
        loadComponent: () =>
          import("./maintenance/ordre-form-page").then(
            (module) => module.OrdreFormPage
          ),
        path: "maintenance/ordres-travail/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.detailNested(
            maintenanceTrail("Ordres de travail", "/maintenance/ordres-travail")
          ),
        },
        loadComponent: () =>
          import("./maintenance/ordre-form-page").then(
            (module) => module.OrdreFormPage
          ),
        path: "maintenance/ordres-travail/:id/modifier",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.detailNested(
            maintenanceTrail("Ordres de travail", "/maintenance/ordres-travail")
          ),
        },
        loadComponent: () =>
          import("./maintenance/ordre-detail-page").then(
            (module) => module.OrdreDetailPage
          ),
        path: "maintenance/ordres-travail/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.nested(
            "Maintenance",
            "/maintenance",
            "Plans d'entretien"
          ),
        },
        loadComponent: () =>
          import("./maintenance/plans-page").then((module) => module.PlansPage),
        path: "maintenance/plans",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.createNested(
            maintenanceTrail("Plans d'entretien", "/maintenance/plans")
          ),
        },
        loadComponent: () =>
          import("./maintenance/plan-form-page").then(
            (module) => module.PlanFormPage
          ),
        path: "maintenance/plans/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.detailNested(
            maintenanceTrail("Plans d'entretien", "/maintenance/plans")
          ),
        },
        loadComponent: () =>
          import("./maintenance/plan-form-page").then(
            (module) => module.PlanFormPage
          ),
        path: "maintenance/plans/:id/modifier",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.detailNested(
            maintenanceTrail("Plans d'entretien", "/maintenance/plans")
          ),
        },
        loadComponent: () =>
          import("./maintenance/plan-detail-page").then(
            (module) => module.PlanDetailPage
          ),
        path: "maintenance/plans/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.nested("Maintenance", "/maintenance", "Sinistres"),
        },
        loadComponent: () =>
          import("./maintenance/sinistres-page").then(
            (module) => module.SinistresPage
          ),
        path: "maintenance/sinistres",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.createNested(
            maintenanceTrail("Sinistres", "/maintenance/sinistres")
          ),
        },
        loadComponent: () =>
          import("./maintenance/sinistre-form-page").then(
            (module) => module.SinistreFormPage
          ),
        path: "maintenance/sinistres/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.detailNested(
            maintenanceTrail("Sinistres", "/maintenance/sinistres")
          ),
        },
        loadComponent: () =>
          import("./maintenance/sinistre-form-page").then(
            (module) => module.SinistreFormPage
          ),
        path: "maintenance/sinistres/:id/modifier",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.detailNested(
            maintenanceTrail("Sinistres", "/maintenance/sinistres")
          ),
        },
        loadComponent: () =>
          import("./maintenance/sinistre-detail-page").then(
            (module) => module.SinistreDetailPage
          ),
        path: "maintenance/sinistres/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.nested("Maintenance", "/maintenance", "Coûts"),
        },
        loadComponent: () =>
          import("./maintenance/couts-page").then((module) => module.CoutsPage),
        path: "maintenance/couts",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.nested(
            "Maintenance",
            "/maintenance",
            "Prestataires"
          ),
        },
        loadComponent: () =>
          import("./maintenance/prestataires-page").then(
            (module) => module.PrestatairesPage
          ),
        path: "maintenance/prestataires",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.createNested(
            maintenanceTrail("Prestataires", "/maintenance/prestataires")
          ),
        },
        loadComponent: () =>
          import("./maintenance/prestataire-form-page").then(
            (module) => module.PrestataireFormPage
          ),
        path: "maintenance/prestataires/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.detailNested(
            maintenanceTrail("Prestataires", "/maintenance/prestataires")
          ),
        },
        loadComponent: () =>
          import("./maintenance/prestataire-form-page").then(
            (module) => module.PrestataireFormPage
          ),
        path: "maintenance/prestataires/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.nested(
            "Maintenance",
            "/maintenance",
            "Assurances"
          ),
        },
        loadComponent: () =>
          import("./maintenance/contrats-page").then(
            (module) => module.ContratsPage
          ),
        path: "maintenance/contrats",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.createNested(
            maintenanceTrail("Assurances", "/maintenance/contrats")
          ),
        },
        loadComponent: () =>
          import("./maintenance/contrat-form-page").then(
            (module) => module.ContratFormPage
          ),
        path: "maintenance/contrats/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("maintenance").roles,
          ...shellBreadcrumb.detailNested(
            maintenanceTrail("Assurances", "/maintenance/contrats")
          ),
        },
        loadComponent: () =>
          import("./maintenance/contrat-form-page").then(
            (module) => module.ContratFormPage
          ),
        path: "maintenance/contrats/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("clients").roles,
          ...shellBreadcrumb.list("Clients"),
        },
        loadComponent: () =>
          import("./clients/clients-page").then((module) => module.ClientsPage),
        path: "clients",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("clients").roles,
          ...shellBreadcrumb.create("Clients", "/clients"),
        },
        loadComponent: () =>
          import("./clients/client-create-page").then(
            (module) => module.ClientCreatePage
          ),
        path: "clients/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("clients").roles,
          ...shellBreadcrumb.detail("Clients", "/clients"),
        },
        loadComponent: () =>
          import("./clients/client-detail-page").then(
            (module) => module.ClientDetailPage
          ),
        path: "clients/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("commandes").roles,
          ...shellBreadcrumb.list("Commandes"),
        },
        loadComponent: () =>
          import("./commandes/commandes-page").then(
            (module) => module.CommandesPage
          ),
        path: "commandes",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("commandes").roles,
          ...shellBreadcrumb.create("Commandes", "/commandes"),
        },
        loadComponent: () =>
          import("./commandes/commande-create-page").then(
            (module) => module.CommandeCreatePage
          ),
        path: "commandes/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("commandes").roles,
          ...shellBreadcrumb.detail("Commandes", "/commandes"),
        },
        loadComponent: () =>
          import("./commandes/commande-detail-page").then(
            (module) => module.CommandeDetailPage
          ),
        path: "commandes/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("dossiers").roles,
          ...shellBreadcrumb.list("Dossiers"),
        },
        loadComponent: () =>
          import("./dossiers/dossiers-page").then(
            (module) => module.DossiersPage
          ),
        path: "dossiers",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: DOSSIERS_PLAN_ROLES,
          ...shellBreadcrumb.create("Dossiers", "/dossiers"),
        },
        loadComponent: () =>
          import("./dossiers/dossier-create-page").then(
            (module) => module.DossierCreatePage
          ),
        path: "dossiers/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("dossiers").roles,
          ...shellBreadcrumb.detail("Dossiers", "/dossiers"),
        },
        loadComponent: () =>
          import("./dossiers/dossier-detail-page").then(
            (module) => module.DossierDetailPage
          ),
        path: "dossiers/:id",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("utilisateurs").roles,
          ...shellBreadcrumb.list("Utilisateurs"),
        },
        loadComponent: () =>
          import("./utilisateurs/utilisateurs-page").then(
            (module) => module.UtilisateursPage
          ),
        path: "utilisateurs",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("utilisateurs").roles,
          ...shellBreadcrumb.create("Utilisateurs", "/utilisateurs"),
        },
        loadComponent: () =>
          import("./utilisateurs/utilisateur-create-page").then(
            (module) => module.UtilisateurCreatePage
          ),
        path: "utilisateurs/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: {
          roles: workDestination("utilisateurs").roles,
          ...shellBreadcrumb.detail("Utilisateurs", "/utilisateurs"),
        },
        loadComponent: () =>
          import("./utilisateurs/utilisateur-detail-page").then(
            (module) => module.UtilisateurDetailPage
          ),
        path: "utilisateurs/:id",
      },
      {
        data: { ...shellBreadcrumb.list("Accès refusé") },
        loadComponent: () =>
          import("./auth/acces-refuse-page").then(
            (module) => module.AccesRefusePage
          ),
        path: "403",
      },
    ],
    loadComponent: () =>
      import("./layout/signed-in-shell").then((module) => module.SignedInShell),
    path: "",
  },
  { path: "**", redirectTo: "" },
];
