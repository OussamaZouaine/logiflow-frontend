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
import { connectListQueryState } from "../shared/ui/list-query-state";
import {
  listKeyboardRows,
  ListRowKeyboard,
  syncListKeyboardActiveId,
} from "../shared/ui/list-row-keyboard";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListSearchBar } from "../shared/ui/list-search-bar";
import { ListStatutFilter } from "../shared/ui/list-statut-filter";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  remorqueCarrosserieLabel,
  remorqueStatutLabel,
  remorqueStatutTone,
  type Remorque,
  VEHICULE_STATUTS,
} from "./remorque";

const REMORQUES_PAGE_SIZE = 20;

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
  selector: "app-remorques-page",
  templateUrl: "./remorques-page.html",
})
export class RemorquesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly remorqueCarrosserieLabel = remorqueCarrosserieLabel;
  protected readonly remorqueStatutLabel = remorqueStatutLabel;
  protected readonly remorqueStatutTone = remorqueStatutTone;
  protected readonly statutOptions = statutOptionsFrom(
    VEHICULE_STATUTS,
    remorqueStatutLabel
  );

  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly activeRowId = signal<string | null>(null);

  protected readonly remorques = httpResource<PageResponse<Remorque>>(() => ({
    params: {
      page: this.page(),
      q: this.search().trim(),
      size: REMORQUES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/remorques`,
  }));

  protected readonly visibleRemorques = computed(() => {
    if (!this.remorques.hasValue()) {
      return [];
    }
    return filterByStatut(
      this.remorques.value().content,
      this.statutFilter(),
      (remorque) => remorque.statut
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.remorques.error())
  );

  protected readonly keyboardRows = computed(() =>
    listKeyboardRows(
      this.visibleRemorques(),
      (remorque) => `/remorques/${remorque.id}`
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
      { searchResetsPage: true, statutValues: [...VEHICULE_STATUTS] }
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
