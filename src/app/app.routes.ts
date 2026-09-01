import type { Route, Routes } from "@angular/router";
import { guestGuard, roleGuard, signedInGuard } from "./core/auth/guards";
import {
  type WorkDestinationId,
  workDestination,
} from "./core/nav/work-destination";

function placeholderRoute(id: WorkDestinationId): Route {
  const destination = workDestination(id);
  return {
    canActivate: [roleGuard],
    data: {
      destinationId: destination.id,
      roles: destination.roles,
    },
    loadComponent: () =>
      import("./layout/module-placeholder-page").then(
        (module) => module.ModulePlaceholderPage
      ),
    path: destination.path,
  };
}

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
      placeholderRoute("vehicules"),
      placeholderRoute("voyages"),
      placeholderRoute("maintenance"),
      placeholderRoute("commandes"),
      placeholderRoute("utilisateurs"),
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
