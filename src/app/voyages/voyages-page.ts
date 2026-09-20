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
import { ItineraireApi } from "../ia/itineraire-api";
import { canCalculerItineraire } from "../ia/itineraire";
import type { GeoMapPathPoint } from "../shared/ui/geo-markers-map";
import { GeoMarkersMap } from "../shared/ui/geo-markers-map";
import {
  voyageItinerairePath,
  voyageItinerairePoints,
  voyageSiteMarkers,
} from "./voyage-sites-map-markers";

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
  private readonly itineraireApi = inject(ItineraireApi);

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
  protected readonly mapRoadPath = signal<readonly GeoMapPathPoint[]>([]);
  protected readonly mapRoadPathLoading = signal(false);
  protected readonly mapRoadPathUnavailable = signal(false);

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
    const lookup = this.voyageMapLookup();
    if (!lookup) {
      return [];
    }
    return voyageSiteMarkers(
      this.selectedVoyage(),
      lookup.dossiersById,
      lookup.sitesById
    );
  });

  protected readonly mapStops = computed(() => {
    const lookup = this.voyageMapLookup();
    if (!lookup) {
      return [];
    }
    return voyageItinerairePoints(
      this.selectedVoyage(),
      lookup.dossiersById,
      lookup.sitesById
    );
  });

  protected readonly mapPath = computed(() => {
    const road = this.mapRoadPath();
    if (road.length >= 2) {
      return road;
    }
    const lookup = this.voyageMapLookup();
    if (!lookup) {
      return [];
    }
    return voyageItinerairePath(
      this.selectedVoyage(),
      lookup.dossiersById,
      lookup.sitesById
    );
  });

  protected readonly mapHint = computed(() => {
    if (this.selectedVoyageId() === null) {
      return "Sélectionnez un voyage pour afficher son itinéraire.";
    }
    const stopCount = this.mapMarkers().length;
    if (stopCount === 0) {
      return "Aucun arrêt géolocalisé pour ce voyage.";
    }
    if (stopCount === 1) {
      return "1 arrêt — ajoutez un second dossier pour tracer l'itinéraire.";
    }
    if (this.mapRoadPathLoading()) {
      return `${stopCount} arrêt(s) — calcul de l'itinéraire routier…`;
    }
    if (this.mapRoadPath().length >= 2) {
      return `${stopCount} arrêt(s) — itinéraire routier (OSRM).`;
    }
    if (this.mapRoadPathUnavailable()) {
      return `${stopCount} arrêt(s) — routage indisponible, tracé direct affiché.`;
    }
    return `${stopCount} arrêt(s) sur le trajet.`;
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

    effect((onCleanup) => {
      const stops = this.mapStops();
      this.mapRoadPath.set([]);
      this.mapRoadPathUnavailable.set(false);

      if (!canCalculerItineraire(stops)) {
        this.mapRoadPathLoading.set(false);
        return;
      }

      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });

      this.mapRoadPathLoading.set(true);
      void this.itineraireApi
        .calculerGeometrie(stops)
        .then((result) => {
          if (cancelled) {
            return;
          }
          this.mapRoadPath.set(result.geometrie);
          this.mapRoadPathUnavailable.set(result.geometrie.length < 2);
        })
        .catch(() => {
          if (cancelled) {
            return;
          }
          this.mapRoadPath.set([]);
          this.mapRoadPathUnavailable.set(true);
        })
        .finally(() => {
          if (!cancelled) {
            this.mapRoadPathLoading.set(false);
          }
        });
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

  private voyageMapLookup(): {
    dossiersById: Map<string, Dossier>;
    sitesById: Map<string, Site>;
  } | null {
    if (!(this.dossiers.hasValue() && this.sites.hasValue())) {
      return null;
    }
    return {
      dossiersById: new Map(
        this.dossiers
          .value()
          .content.map((dossier) => [dossier.id, dossier] as const)
      ),
      sitesById: new Map(
        this.sites.value().content.map((site) => [site.id, site] as const)
      ),
    };
  }
}
