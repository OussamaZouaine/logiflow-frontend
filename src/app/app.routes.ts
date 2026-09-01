import type { Routes } from "@angular/router";
import { guestGuard, roleGuard, signedInGuard } from "./core/auth/guards";
import { workDestination } from "./core/nav/work-destination";

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
        loadComponent: () =>
          import("./tableau/tableau-de-bord-page").then(
            (module) => module.TableauDeBordPage
          ),
        path: "",
        pathMatch: "full",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("sites").roles },
        loadComponent: () =>
          import("./sites/sites-page").then((module) => module.SitesPage),
        path: "sites",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("sites").roles },
        loadComponent: () =>
          import("./sites/site-create-page").then(
            (module) => module.SiteCreatePage
          ),
        path: "sites/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("sites").roles },
        loadComponent: () =>
          import("./sites/site-detail-page").then(
            (module) => module.SiteDetailPage
          ),
        path: "sites/:id",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("vehicules").roles },
        loadComponent: () =>
          import("./vehicules/vehicules-page").then(
            (module) => module.VehiculesPage
          ),
        path: "vehicules",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("vehicules").roles },
        loadComponent: () =>
          import("./vehicules/vehicule-create-page").then(
            (module) => module.VehiculeCreatePage
          ),
        path: "vehicules/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("vehicules").roles },
        loadComponent: () =>
          import("./vehicules/vehicule-detail-page").then(
            (module) => module.VehiculeDetailPage
          ),
        path: "vehicules/:id",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("voyages").roles },
        loadComponent: () =>
          import("./voyages/voyages-page").then((module) => module.VoyagesPage),
        path: "voyages",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("voyages").roles },
        loadComponent: () =>
          import("./voyages/voyage-create-page").then(
            (module) => module.VoyageCreatePage
          ),
        path: "voyages/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("voyages").roles },
        loadComponent: () =>
          import("./voyages/voyage-detail-page").then(
            (module) => module.VoyageDetailPage
          ),
        path: "voyages/:id",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("maintenance").roles },
        loadComponent: () =>
          import("./maintenance/maintenance-page").then(
            (module) => module.MaintenancePage
          ),
        path: "maintenance",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("maintenance").roles },
        loadComponent: () =>
          import("./maintenance/ordre-create-page").then(
            (module) => module.OrdreCreatePage
          ),
        path: "maintenance/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("maintenance").roles },
        loadComponent: () =>
          import("./maintenance/ordre-detail-page").then(
            (module) => module.OrdreDetailPage
          ),
        path: "maintenance/:id",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("commandes").roles },
        loadComponent: () =>
          import("./commandes/commandes-page").then(
            (module) => module.CommandesPage
          ),
        path: "commandes",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("commandes").roles },
        loadComponent: () =>
          import("./commandes/commande-create-page").then(
            (module) => module.CommandeCreatePage
          ),
        path: "commandes/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("commandes").roles },
        loadComponent: () =>
          import("./commandes/commande-detail-page").then(
            (module) => module.CommandeDetailPage
          ),
        path: "commandes/:id",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("utilisateurs").roles },
        loadComponent: () =>
          import("./utilisateurs/utilisateurs-page").then(
            (module) => module.UtilisateursPage
          ),
        path: "utilisateurs",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("utilisateurs").roles },
        loadComponent: () =>
          import("./utilisateurs/utilisateur-create-page").then(
            (module) => module.UtilisateurCreatePage
          ),
        path: "utilisateurs/nouveau",
      },
      {
        canActivate: [roleGuard],
        data: { roles: workDestination("utilisateurs").roles },
        loadComponent: () =>
          import("./utilisateurs/utilisateur-detail-page").then(
            (module) => module.UtilisateurDetailPage
          ),
        path: "utilisateurs/:id",
      },
      {
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
