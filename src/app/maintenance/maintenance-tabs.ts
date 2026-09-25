import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

import {
  ZardTabComponent,
  ZardTabGroupComponent,
} from "@/shared/components/tabs";

/** Sections du module maintenance (ordre des onglets). */
export const SECTIONS_MAINTENANCE = [
  { label: "Tableau de bord", lien: "/maintenance" },
  { label: "Ordres de travail", lien: "/maintenance/ordres-travail" },
  { label: "Plans d'entretien", lien: "/maintenance/plans" },
  { label: "Sinistres", lien: "/maintenance/sinistres" },
  { label: "Coûts", lien: "/maintenance/couts" },
  { label: "Prestataires", lien: "/maintenance/prestataires" },
  { label: "Assurances", lien: "/maintenance/contrats" },
] as const;

/** Onglet d'une URL : la section dont le lien est le plus long préfixe du chemin. */
export function indexSectionMaintenance(url: string): number {
  const chemin = url.split("?")[0] ?? "";
  let meilleur = 0;
  SECTIONS_MAINTENANCE.forEach((section, index) => {
    const correspond =
      chemin === section.lien || chemin.startsWith(`${section.lien}/`);
    if (
      correspond &&
      section.lien.length > SECTIONS_MAINTENANCE[meilleur].lien.length
    ) {
      meilleur = index;
    }
  });
  return meilleur;
}

@Component({
  imports: [ZardTabComponent, ZardTabGroupComponent],
  selector: "app-maintenance-tabs",
  templateUrl: "./maintenance-tabs.html",
})
export class MaintenanceTabs {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly tabGroup = viewChild(ZardTabGroupComponent);

  protected readonly sections = SECTIONS_MAINTENANCE;

  constructor() {
    const syncActiveTab = () => {
      this.tabGroup()?.selectTabByIndex(
        indexSectionMaintenance(this.router.url)
      );
    };

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => syncActiveTab());

    afterNextRender(() => syncActiveTab());
  }

  protected onTabChange(event: { index: number }): void {
    // selectTabByIndex (synchronisation avec l'URL) émet aussi zTabChange : on ne navigue que si
    // l'utilisateur a choisi une autre section que celle de la page courante.
    if (event.index === indexSectionMaintenance(this.router.url)) {
      return;
    }
    const cible = SECTIONS_MAINTENANCE[event.index]?.lien;
    if (cible) {
      this.router.navigateByUrl(cible);
    }
  }
}
