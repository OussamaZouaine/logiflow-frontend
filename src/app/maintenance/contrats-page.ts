import { httpResource } from "@angular/common/http";
import { Component, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListTableSkeleton } from "../shared/ui/list-table-skeleton";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  type ContratAssurance,
  formatDate,
  formatMontant,
  libelle,
} from "./maintenance";
import { creerLookupsMaintenance } from "./maintenance-lookups";
import { MaintenanceTabs } from "./maintenance-tabs";

/** Contrats d'assurance de la flotte (garanties, franchise, période, engins couverts). */
@Component({
  imports: [
    RouterLink,
    StatutChip,
    ListPagination,
    ListEmptyState,
    ListTableSkeleton,
    MaintenanceTabs,
  ],
  selector: "app-contrats-page",
  templateUrl: "./contrats-page.html",
})
export class ContratsPage {
  protected readonly lookups = creerLookupsMaintenance();
  protected readonly libelle = libelle;
  protected readonly formatDate = formatDate;
  protected readonly formatMontant = formatMontant;

  protected readonly page = signal(0);

  protected readonly contrats = httpResource<PageResponse<ContratAssurance>>(
    () => ({
      params: { page: this.page(), size: 20 },
      url: `${environment.apiBaseUrl}/maintenance/contrats-assurance`,
    })
  );

  protected readonly erreur = computed(() =>
    httpErrorMessage(this.contrats.error())
  );

  protected couverture(c: ContratAssurance): string {
    if (c.type === "FLOTTE") {
      return "Toute la flotte";
    }
    return c.engins
      .map((e) => this.lookups.engins().get(e.id)?.immatriculation ?? "…")
      .join(", ");
  }
}
