import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { filterByStatut, statutOptionsFrom } from "../shared/ui/list-filter";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListTableSkeleton } from "../shared/ui/list-table-skeleton";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListSearchBar } from "../shared/ui/list-search-bar";
import { connectListQueryState } from "../shared/ui/list-query-state";
import {
  listKeyboardRows,
  ListRowKeyboard,
  syncListKeyboardActiveId,
} from "../shared/ui/list-row-keyboard";
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
    ListSearchBar,
    ListStatutFilter,
    ListPagination,
    ListEmptyState,
    ListRowKeyboard,
    ListTableSkeleton,
  ],
  selector: "app-commandes-page",
  templateUrl: "./commandes-page.html",
})
export class CommandesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formatDate = formatDate;
  protected readonly formatMoney = formatMoney;
  protected readonly statutCommandeLabel = statutCommandeLabel;
  protected readonly commandeStatutTone = commandeStatutTone;
  protected readonly statutOptions = statutOptionsFrom(
    STATUT_COMMANDES,
    statutCommandeLabel
  );
  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly activeRowId = signal<string | null>(null);

  protected readonly commandes = httpResource<PageResponse<Commande>>(() => ({
    params: {
      page: this.page(),
      q: this.search().trim(),
      size: COMMANDES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/commandes`,
  }));

  protected readonly visibleCommandes = computed(() => {
    if (!this.commandes.hasValue()) {
      return [];
    }
    return filterByStatut(
      this.commandes.value().content,
      this.statutFilter(),
      (commande) => commande.statut
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.commandes.error())
  );

  protected readonly keyboardRows = computed(() =>
    listKeyboardRows(
      this.visibleCommandes(),
      (commande) => `/commandes/${commande.id}`
    )
  );

  constructor() {
    connectListQueryState(
      this.route,
      this.router,
      this.destroyRef,
      {
        page: this.page,
        q: this.search,
        searchDraft: this.searchDraft,
        statut: this.statutFilter,
      },
      { searchResetsPage: true, statutValues: STATUT_COMMANDES }
    );

    effect(() => {
      syncListKeyboardActiveId(this.keyboardRows(), this.activeRowId);
    });
  }

  protected clearFilters(): void {
    this.searchDraft.set("");
    this.search.set("");
    this.statutFilter.set(null);
    this.page.set(0);
  }
}
