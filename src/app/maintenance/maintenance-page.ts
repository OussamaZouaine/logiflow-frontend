import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { filterByStatut, statutOptionsFrom } from "../shared/ui/list-filter";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListTableSkeleton } from "../shared/ui/list-table-skeleton";
import {
  DEFAULT_LIST_PAGE_SIZE,
  LIST_PAGE_SIZE_OPTIONS,
  resolveListPageSize,
} from "../shared/ui/list-page-size";
import { ListPagination } from "../shared/ui/list-pagination";
import { connectListQueryState } from "../shared/ui/list-query-state";
import {
  listKeyboardRows,
  ListRowKeyboard,
  syncListKeyboardActiveId,
} from "../shared/ui/list-row-keyboard";
import { ListStatutFilter } from "../shared/ui/list-statut-filter";
import { StatutChip } from "../shared/ui/statut-chip";
import { MaintenanceTabs } from "./maintenance-tabs";
import {
  formatDateTime,
  formatMoney,
  formatOrdreShortId,
  STATUT_OT,
  statutOtLabel,
  statutOtTone,
  type OrdreTravail,
  type VehiculeLookup,
  typeInterventionLabel,
  vehiculeLabel,
} from "./ordre-travail";

const VEHICULE_LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [
    RouterLink,
    StatutChip,
    MaintenanceTabs,
    ListStatutFilter,
    ListPagination,
    ListEmptyState,
    ListRowKeyboard,
    ListTableSkeleton,
  ],
  selector: "app-maintenance-page",
  templateUrl: "./maintenance-page.html",
})
export class MaintenancePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formatDateTime = formatDateTime;
  protected readonly formatMoney = formatMoney;
  protected readonly formatOrdreShortId = formatOrdreShortId;
  protected readonly statutOtLabel = statutOtLabel;
  protected readonly statutOtTone = statutOtTone;
  protected readonly typeInterventionLabel = typeInterventionLabel;
  protected readonly vehiculeLabel = vehiculeLabel;
  protected readonly statutOptions = statutOptionsFrom(
    STATUT_OT,
    statutOtLabel
  );

  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly pageSizeOptions = LIST_PAGE_SIZE_OPTIONS;
  protected readonly pageSize = signal(DEFAULT_LIST_PAGE_SIZE);
  protected readonly activeRowId = signal<string | null>(null);
  protected readonly vehiculeFilterId = signal<string | null>(null);

  protected readonly ordres = httpResource<PageResponse<OrdreTravail>>(() => {
    const params: Record<string, string | number> = {
      page: this.page(),
      size: resolveListPageSize(this.pageSize()),
    };
    const vehiculeId = this.vehiculeFilterId();
    if (vehiculeId) {
      params["vehiculeId"] = vehiculeId;
    }
    return {
      params,
      url: `${environment.apiBaseUrl}/ordres-travail`,
    };
  });

  protected readonly vehicules = httpResource<PageResponse<VehiculeLookup>>(
    () => ({
      params: { page: 0, size: VEHICULE_LOOKUP_PAGE_SIZE },
      url: `${environment.apiBaseUrl}/vehicules`,
    })
  );

  protected readonly vehiculeLookups = computed(
    () => this.vehicules.value()?.content ?? []
  );

  protected readonly visibleOrdres = computed(() => {
    if (!this.ordres.hasValue()) {
      return [];
    }
    return filterByStatut(
      this.ordres.value().content,
      this.statutFilter(),
      (ordre) => ordre.statut
    );
  });

  protected readonly errorMessage = computed(() => {
    const error = this.ordres.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly filteredVehiculeLabel = computed(() => {
    const vehiculeId = this.vehiculeFilterId();
    if (!vehiculeId) {
      return null;
    }
    return vehiculeLabel(vehiculeId, this.vehiculeLookups());
  });

  protected readonly keyboardRows = computed(() =>
    listKeyboardRows(
      this.visibleOrdres(),
      (ordre) => `/maintenance/${ordre.id}`
    )
  );

  constructor() {
    connectListQueryState(
      this.route,
      this.router,
      this.destroyRef,
      {
        page: this.page,
        statut: this.statutFilter,
      },
      { statutValues: STATUT_OT }
    );

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paramMap) => {
        const vehiculeId = paramMap.get("vehiculeId");
        this.vehiculeFilterId.set(
          vehiculeId && vehiculeId.length > 0 ? vehiculeId : null
        );
      });

    effect(() => {
      syncListKeyboardActiveId(this.keyboardRows(), this.activeRowId);
    });
  }

  protected clearFilters(): void {
    this.statutFilter.set(null);
    this.page.set(0);
    if (this.vehiculeFilterId()) {
      void this.router.navigate([], {
        queryParams: { vehiculeId: null },
        queryParamsHandling: "merge",
        replaceUrl: true,
      });
    }
  }
}
