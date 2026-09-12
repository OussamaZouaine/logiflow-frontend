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
import { VOYAGES_PLAN_ROLES } from "../core/auth/role";
import type { Dossier } from "../dossiers/dossier";
import { filterByStatut, statutOptionsFrom } from "../shared/ui/list-filter";
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
import { ListStatutFilter } from "../shared/ui/list-statut-filter";
import type { Site } from "../sites/site";
import { StatutChip } from "../shared/ui/statut-chip";
import { voyageStatutTone } from "../tableau/apercu";
import {
  formatInstant,
  porteeLabel,
  STATUT_VOYAGES,
  statutVoyageLabel,
  typeVoyageLabel,
  type Voyage,
} from "./voyage";
import { voyageSiteMarkers } from "./voyage-sites-map-markers";
import { GeoMarkersMap } from "../shared/ui/geo-markers-map";

const VOYAGES_PAGE_SIZE = 20;
const LOOKUP_PAGE_SIZE = 100;

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
  selector: "app-voyages-page",
  templateUrl: "./voyages-page.html",
})
export class VoyagesPage {
  private readonly session = inject(DemoSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formatInstant = formatInstant;
  protected readonly porteeLabel = porteeLabel;
  protected readonly statutVoyageLabel = statutVoyageLabel;
  protected readonly typeVoyageLabel = typeVoyageLabel;
  protected readonly voyageStatutTone = voyageStatutTone;
  protected readonly statutOptions = statutOptionsFrom(
    STATUT_VOYAGES,
    statutVoyageLabel
  );
  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly selectedVoyageId = signal<string | null>(null);

  protected readonly canPlan = computed(() =>
    this.session.hasAnyRole(VOYAGES_PLAN_ROLES)
  );

  protected readonly voyages = httpResource<PageResponse<Voyage>>(() => ({
    params: {
      page: this.page(),
      q: this.search().trim(),
      size: VOYAGES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/voyages`,
  }));

  protected readonly dossiers = httpResource<PageResponse<Dossier>>(() => ({
    params: {
      page: 0,
      size: LOOKUP_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/dossiers`,
  }));

  protected readonly sites = httpResource<PageResponse<Site>>(() => ({
    params: {
      page: 0,
      size: LOOKUP_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/sites`,
  }));

  protected readonly visibleVoyages = computed(() => {
    if (!this.voyages.hasValue()) {
      return [];
    }
    return filterByStatut(
      this.voyages.value().content,
      this.statutFilter(),
      (voyage) => voyage.statut
    );
  });

  protected readonly selectedVoyage = computed(() => {
    const id = this.selectedVoyageId();
    if (id === null) {
      return null;
    }
    return this.visibleVoyages().find((voyage) => voyage.id === id) ?? null;
  });

  protected readonly mapMarkers = computed(() => {
    if (!(this.dossiers.hasValue() && this.sites.hasValue())) {
      return [];
    }
    const dossiersById = new Map(
      this.dossiers.value().content.map((dossier) => [dossier.id, dossier] as const)
    );
    const sitesById = new Map(
      this.sites.value().content.map((site) => [site.id, site] as const)
    );
    return voyageSiteMarkers(this.selectedVoyage(), dossiersById, sitesById);
  });

  protected readonly mapHint = computed(() => {
    if (this.selectedVoyageId() === null) {
      return "Sélectionnez un voyage pour afficher ses sites.";
    }
    if (this.mapMarkers().length === 0) {
      return "Aucun site géolocalisé pour ce voyage.";
    }
    return `${this.mapMarkers().length} site(s) sur le trajet.`;
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.voyages.error())
  );

  protected readonly keyboardRows = computed(() =>
    listKeyboardRows(
      this.visibleVoyages(),
      (voyage) => `/voyages/${voyage.id}`
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
      { searchResetsPage: true, statutValues: STATUT_VOYAGES }
    );

    effect(() => {
      syncListKeyboardActiveId(this.keyboardRows(), this.selectedVoyageId);
    });
  }

  protected clearFilters(): void {
    this.searchDraft.set("");
    this.search.set("");
    this.statutFilter.set(null);
    this.page.set(0);
  }

  protected selectVoyage(voyageId: string): void {
    this.selectedVoyageId.set(voyageId);
  }
}
