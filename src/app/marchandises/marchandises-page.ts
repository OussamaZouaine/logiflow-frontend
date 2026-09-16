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
import { filterByStatut } from "../shared/ui/list-filter";
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
import {
  ListStatutFilter,
  type ListStatutOption,
} from "../shared/ui/list-statut-filter";
import {
  actifLabel,
  actifTone,
  StatutChip,
} from "../shared/ui/statut-chip";
import {
  formatMarchandiseLabel,
  gerbableLabel,
  type Marchandise,
} from "./marchandise";

const MARCHANDISES_PAGE_SIZE = 20;

const ACTIF_OPTIONS: readonly ListStatutOption[] = [
  { label: "Actif", value: "true" },
  { label: "Inactif", value: "false" },
];

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
  selector: "app-marchandises-page",
  templateUrl: "./marchandises-page.html",
})
export class MarchandisesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly actifLabel = actifLabel;
  protected readonly actifTone = actifTone;
  protected readonly actifOptions = ACTIF_OPTIONS;
  protected readonly formatMarchandiseLabel = formatMarchandiseLabel;
  protected readonly gerbableLabel = gerbableLabel;
  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly actifFilter = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly activeRowId = signal<string | null>(null);

  protected readonly marchandises = httpResource<PageResponse<Marchandise>>(
    () => ({
      params: {
        page: this.page(),
        q: this.search().trim(),
        size: MARCHANDISES_PAGE_SIZE,
      },
      url: `${environment.apiBaseUrl}/marchandises`,
    })
  );

  protected readonly visibleMarchandises = computed(() => {
    if (!this.marchandises.hasValue()) {
      return [];
    }
    return filterByStatut(
      this.marchandises.value().content,
      this.actifFilter(),
      (marchandise) => (marchandise.actif ? "true" : "false")
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.marchandises.error())
  );

  protected readonly keyboardRows = computed(() =>
    listKeyboardRows(
      this.visibleMarchandises(),
      (marchandise) => `/marchandises/${marchandise.id}`
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
        statut: this.actifFilter,
      },
      { searchResetsPage: true, statutValues: ["true", "false"] }
    );

    effect(() => {
      syncListKeyboardActiveId(this.keyboardRows(), this.activeRowId);
    });
  }

  protected clearFilters(): void {
    this.searchDraft.set("");
    this.search.set("");
    this.actifFilter.set(null);
    this.page.set(0);
  }
}
