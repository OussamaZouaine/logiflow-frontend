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
import {
  DEFAULT_LIST_PAGE_SIZE,
  LIST_PAGE_SIZE_OPTIONS,
  resolveListPageSize,
} from "../shared/ui/list-page-size";
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
import { CarburantTabs } from "./carburant-tabs";
import type { Station } from "./station";

const ACTIF_OPTIONS: readonly ListStatutOption[] = [
  { label: "Actif", value: "true" },
  { label: "Inactif", value: "false" },
];

@Component({
  imports: [
    RouterLink,
    StatutChip,
    CarburantTabs,
    ListSearchBar,
    ListStatutFilter,
    ListPagination,
    ListEmptyState,
    ListRowKeyboard,
    ListTableSkeleton,
  ],
  selector: "app-stations-page",
  templateUrl: "./stations-page.html",
})
export class StationsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly actifLabel = actifLabel;
  protected readonly actifTone = actifTone;
  protected readonly actifOptions = ACTIF_OPTIONS;
  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly actifFilter = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly pageSizeOptions = LIST_PAGE_SIZE_OPTIONS;
  protected readonly pageSize = signal(DEFAULT_LIST_PAGE_SIZE);
  protected readonly selectedStationId = signal<string | null>(null);

  protected readonly stations = httpResource<PageResponse<Station>>(() => ({
    params: {
      page: this.page(),
      q: this.search().trim(),
      size: resolveListPageSize(this.pageSize()),
    },
    url: `${environment.apiBaseUrl}/stations`,
  }));

  protected readonly visibleStations = computed(() => {
    if (!this.stations.hasValue()) {
      return [];
    }
    return filterByStatut(
      this.stations.value().content,
      this.actifFilter(),
      (station) => (station.actif ? "true" : "false")
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.stations.error())
  );

  protected readonly keyboardRows = computed(() =>
    listKeyboardRows(
      this.visibleStations(),
      (station) => `/carburant/stations/${station.id}`
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
      syncListKeyboardActiveId(this.keyboardRows(), this.selectedStationId);
    });
  }

  protected resetFilters(): void {
    this.searchDraft.set("");
    this.search.set("");
    this.actifFilter.set(null);
    this.page.set(0);
  }

  protected selectStation(stationId: string): void {
    this.selectedStationId.set(stationId);
  }
}
