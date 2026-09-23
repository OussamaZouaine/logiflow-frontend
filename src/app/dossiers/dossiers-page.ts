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
import { DemoSessionService } from "../core/auth/demo-session";
import { DOSSIERS_PLAN_ROLES } from "../core/auth/role";
import { filterByStatut, statutOptionsFrom } from "../shared/ui/list-filter";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListTableSkeleton } from "../shared/ui/list-table-skeleton";
import {
  DEFAULT_LIST_PAGE_SIZE,
  LIST_PAGE_SIZE_OPTIONS,
  resolveListPageSize,
} from "../shared/ui/list-page-size";
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
import { dossierStatutTone } from "../tableau/apercu";
import {
  type Dossier,
  STATUT_DOSSIERS,
  statutDossierLabel,
  typeTransportLabel,
} from "./dossier";

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
  selector: "app-dossiers-page",
  templateUrl: "./dossiers-page.html",
})
export class DossiersPage {
  private readonly session = inject(DemoSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statutDossierLabel = statutDossierLabel;
  protected readonly dossierStatutTone = dossierStatutTone;
  protected readonly typeTransportLabel = typeTransportLabel;
  protected readonly statutOptions = statutOptionsFrom(
    STATUT_DOSSIERS,
    statutDossierLabel
  );
  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly pageSizeOptions = LIST_PAGE_SIZE_OPTIONS;
  protected readonly pageSize = signal(DEFAULT_LIST_PAGE_SIZE);
  protected readonly activeRowId = signal<string | null>(null);

  protected readonly canPlan = computed(() =>
    this.session.hasAnyRole(DOSSIERS_PLAN_ROLES)
  );

  protected readonly dossiers = httpResource<PageResponse<Dossier>>(() => ({
    params: {
      page: this.page(),
      q: this.search().trim(),
      size: resolveListPageSize(this.pageSize()),
    },
    url: `${environment.apiBaseUrl}/dossiers`,
  }));

  protected readonly visibleDossiers = computed(() => {
    if (!this.dossiers.hasValue()) {
      return [];
    }
    return filterByStatut(
      this.dossiers.value().content,
      this.statutFilter(),
      (dossier) => dossier.statut
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.dossiers.error())
  );

  protected readonly keyboardRows = computed(() =>
    listKeyboardRows(
      this.visibleDossiers(),
      (dossier) => `/dossiers/${dossier.id}`
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
      { searchResetsPage: true, statutValues: STATUT_DOSSIERS }
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
