import { httpResource } from "@angular/common/http";
import { Component, computed, DestroyRef, inject, input } from "@angular/core";
import { bindShellBreadcrumbLeaf } from "../core/nav/shell-breadcrumb-leaf";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import {
  formatPeriodicite,
  type PlanEntretien,
  vehiculeLabel,
} from "./plan-entretien";
import type { VehiculeLookup } from "./ordre-travail";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [RouterLink, ...FICHE_PAGE_IMPORTS],
  selector: "app-plan-entretien-detail-page",
  templateUrl: "./plan-entretien-detail-page.html",
})
export class PlanEntretienDetailPage {
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required<string>();

  constructor() {
    bindShellBreadcrumbLeaf(
      this.destroyRef,
      computed(() =>
        this.plan.hasValue() ? this.plan.value().libelle : null
      )
    );
  }

  protected readonly formatPeriodicite = formatPeriodicite;
  protected readonly vehiculeLabel = vehiculeLabel;

  protected readonly plan = httpResource<PlanEntretien>(() => ({
    url: `${environment.apiBaseUrl}/plans-entretien/${this.id()}`,
  }));

  protected readonly vehicules = httpResource<PageResponse<VehiculeLookup>>(
    () => ({
      params: { page: 0, size: LOOKUP_PAGE_SIZE },
      url: `${environment.apiBaseUrl}/vehicules`,
    })
  );

  protected readonly vehiculeLookups = computed(
    () => this.vehicules.value()?.content ?? []
  );

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.plan.error())
  );
}
