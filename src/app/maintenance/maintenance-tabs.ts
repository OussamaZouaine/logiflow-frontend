import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

/** Sections du module maintenance. */
export const SECTIONS_MAINTENANCE = [
  { exact: true, label: "Tableau de bord", lien: "/maintenance" },
  {
    exact: false,
    label: "Ordres de travail",
    lien: "/maintenance/ordres-travail",
  },
  { exact: false, label: "Plans d'entretien", lien: "/maintenance/plans" },
  { exact: false, label: "Sinistres", lien: "/maintenance/sinistres" },
  { exact: false, label: "Coûts", lien: "/maintenance/couts" },
  { exact: false, label: "Prestataires", lien: "/maintenance/prestataires" },
  { exact: false, label: "Assurances", lien: "/maintenance/contrats" },
] as const;

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: "app-maintenance-tabs",
  templateUrl: "./maintenance-tabs.html",
})
export class MaintenanceTabs {
  protected readonly sections = SECTIONS_MAINTENANCE;
}
