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
import {
  ListTableSkeleton,
  MapAsideSkeleton,
} from "../shared/ui/list-table-skeleton";
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
import { GeoMarkersMap } from "../shared/ui/geo-markers-map";
import {
  actifLabel,
  actifTone,
  StatutChip,
} from "../shared/ui/statut-chip";
import type { Site } from "./site";
import { siteListMarkers } from "./site-list-markers";

const SITES_PAGE_SIZE = 20;

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
    MapAsideSkeleton,
    GeoMarkersMap,
  ],
  selector: "app-sites-page",
  templateUrl: "./sites-page.html",
})
export class SitesPage {
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
  protected readonly selectedSiteId = signal<string | null>(null);

  protected readonly sites = httpResource<PageResponse<Site>>(() => ({
    params: {
      page: this.page(),
      q: this.search().trim(),
      size: SITES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/sites`,
  }));

  protected readonly visibleSites = computed(() => {
    if (!this.sites.hasValue()) {
      return [];
    }
    return filterByStatut(
      this.sites.value().content,
      this.actifFilter(),
      (site) => (site.actif ? "true" : "false")
    );
  });

  protected readonly mapMarkers = computed(() =>
    siteListMarkers(this.visibleSites())
  );

  protected readonly mapHint = computed(() => {
    const count = this.mapMarkers().length;
    if (count === 0) {
      return "Aucun site géolocalisé sur cette page.";
    }
    if (this.selectedSiteId()) {
      return "Site sélectionné mis en avant sur la carte.";
    }
    return `${count} site(s) affiché(s) sur la carte.`;
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.sites.error())
  );

  protected readonly keyboardRows = computed(() =>
    listKeyboardRows(this.visibleSites(), (site) => `/sites/${site.id}`)
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
      syncListKeyboardActiveId(this.keyboardRows(), this.selectedSiteId);
    });
  }

  protected clearFilters(): void {
    this.searchDraft.set("");
    this.search.set("");
    this.actifFilter.set(null);
    this.page.set(0);
  }

  protected selectSite(siteId: string): void {
    this.selectedSiteId.set(siteId);
  }
}
