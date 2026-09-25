import { httpResource } from "@angular/common/http";
import { Component, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import {
  enumToSelectOptions,
  FieldSelectComponent,
  isFieldSelectNone,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListTableSkeleton } from "../shared/ui/list-table-skeleton";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  formatEcheance,
  formatPeriodicite,
  libelle,
  libelleEngin,
  type PlanEntretien,
  parametresRequete,
  TYPES_ENGIN,
  toneEcheance,
} from "./maintenance";
import { creerLookupsMaintenance } from "./maintenance-lookups";
import { MaintenanceTabs } from "./maintenance-tabs";

/** Plans d'entretien de la flotte et leur prochaine échéance. */
@Component({
  imports: [
    RouterLink,
    StatutChip,
    FieldSelectComponent,
    ListPagination,
    ListEmptyState,
    ListTableSkeleton,
    MaintenanceTabs,
  ],
  selector: "app-plans-page",
  templateUrl: "./plans-page.html",
})
export class PlansPage {
  protected readonly lookups = creerLookupsMaintenance();
  protected readonly libelle = libelle;
  protected readonly libelleEngin = libelleEngin;
  protected readonly formatPeriodicite = formatPeriodicite;
  protected readonly formatEcheance = formatEcheance;
  protected readonly toneEcheance = toneEcheance;

  protected readonly enginTypeOptions = withNoneSelectOption(
    "Tous les engins",
    enumToSelectOptions(TYPES_ENGIN, libelle)
  );

  /** « echeances » : vue des échéances à 30 jours ; « tous » : liste paginée. */
  protected readonly vue = signal<"echeances" | "tous">("echeances");
  protected readonly typeEngin = signal("");
  protected readonly page = signal(0);

  protected readonly echeances = httpResource<PlanEntretien[]>(() =>
    this.vue() === "echeances"
      ? {
          params: { horizonJours: 30 },
          url: `${environment.apiBaseUrl}/maintenance/plans/echeances`,
        }
      : undefined
  );

  protected readonly plans = httpResource<PageResponse<PlanEntretien>>(() => {
    if (this.vue() !== "tous") {
      return;
    }
    const params = parametresRequete({
      page: this.page(),
      size: 20,
      typeEngin: this.typeEngin(),
    });
    return { params, url: `${environment.apiBaseUrl}/maintenance/plans` };
  });

  protected readonly lignes = computed<readonly PlanEntretien[]>(() => {
    if (this.vue() === "echeances") {
      const type = this.typeEngin();
      return (this.echeances.value() ?? []).filter(
        (p) => !type || isFieldSelectNone(type) || p.engin.type === type
      );
    }
    return this.plans.value()?.content ?? [];
  });

  protected readonly chargement = computed(() =>
    this.vue() === "echeances"
      ? this.echeances.isLoading()
      : this.plans.isLoading()
  );
  protected readonly erreur = computed(() => {
    const e =
      this.vue() === "echeances" ? this.echeances.error() : this.plans.error();
    return e ? httpErrorMessage(e) : null;
  });

  protected choisirVue(vue: "echeances" | "tous"): void {
    this.vue.set(vue);
    this.page.set(0);
  }
}
