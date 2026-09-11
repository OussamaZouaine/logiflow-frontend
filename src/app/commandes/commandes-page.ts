import { httpResource } from "@angular/common/http";
import { Component, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { filterByStatut, statutOptionsFrom } from "../shared/ui/list-filter";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListStatutFilter } from "../shared/ui/list-statut-filter";
import { StatutChip } from "../shared/ui/statut-chip";
import { commandeStatutTone } from "../tableau/apercu";
import {
  type Commande,
  formatDate,
  formatMoney,
  STATUT_COMMANDES,
  statutCommandeLabel,
} from "./commande";

const COMMANDES_PAGE_SIZE = 20;

@Component({
  imports: [
    RouterLink,
    StatutChip,
    ListStatutFilter,
    ListPagination,
    ListEmptyState,
  ],
  selector: "app-commandes-page",
  templateUrl: "./commandes-page.html",
})
export class CommandesPage {
  protected readonly formatDate = formatDate;
  protected readonly formatMoney = formatMoney;
  protected readonly statutCommandeLabel = statutCommandeLabel;
  protected readonly commandeStatutTone = commandeStatutTone;
  protected readonly statutOptions = statutOptionsFrom(
    STATUT_COMMANDES,
    statutCommandeLabel
  );
  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);

  protected readonly commandes = httpResource<PageResponse<Commande>>(() => ({
    params: {
      page: this.page(),
      size: COMMANDES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/commandes`,
  }));

  protected readonly visibleCommandes = computed(() => {
    const page = this.commandes.value();
    if (!page) {
      return [];
    }
    return filterByStatut(
      page.content,
      this.statutFilter(),
      (commande) => commande.statut
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.commandes.error())
  );

  protected clearFilters(): void {
    this.statutFilter.set(null);
  }
}
