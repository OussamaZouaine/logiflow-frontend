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
import { ListToolbarCta } from "../shared/ui/list-toolbar-cta";
import { NgIcon } from "@ng-icons/core";
import {
  DESTINATION_NAV_ICON,
  LIST_TABLE_ROW_ICON_PROVIDERS,
} from "../shared/ui/list-table-row-icons";
import { ZardTableImports } from "@/shared/components/table/table.imports";
import { MaintenanceTabs } from "./maintenance-tabs";
import {
  formatPeriodicite,
  type PlanEntretien,
  vehiculeLabel,
} from "./plan-entretien";
import type { VehiculeLookup } from "./ordre-travail";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [
    NgIcon,
    RouterLink,
    MaintenanceTabs,
    ListToolbarCta,
    ListPagination,
    ListEmptyState,
    ListRowKeyboard,
    ListTableSkeleton,
    ...ZardTableImports,
  ],
  selector: "app-plans-entretien-page",
  templateUrl: "./plans-entretien-page.html",
  viewProviders: [LIST_TABLE_ROW_ICON_PROVIDERS],
})
export class PlansEntretienPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formatPeriodicite = formatPeriodicite;
  protected readonly vehiculeLabel = vehiculeLabel;
  protected readonly rowIcon = DESTINATION_NAV_ICON.maintenance;

  protected readonly page = signal(0);
  protected readonly pageSizeOptions = LIST_PAGE_SIZE_OPTIONS;
  protected readonly pageSize = signal(DEFAULT_LIST_PAGE_SIZE);
  protected readonly activeRowId = signal<string | null>(null);
  protected readonly vehiculeFilterId = signal<string | null>(null);

  protected readonly plans = httpResource<PageResponse<PlanEntretien>>(() => {
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
      url: `${environment.apiBaseUrl}/plans-entretien`,
    };
  });

  protected readonly vehicules = httpResource<PageResponse<VehiculeLookup>>(
    () => ({
      params: { page: 0, size: LOOKUP_PAGE_SIZE },
      url: `${environment.apiBaseUrl}/vehicules`,
    })
  );

  protected readonly vehiculeLookups = computed(
    () => this.vehicules.value()?.content ?? []
  );

  protected readonly errorMessage = computed(() => {
    const error = this.plans.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly filteredVehiculeLabel = computed(() => {
    const vehiculeId = this.vehiculeFilterId();
    if (!vehiculeId) {
      return null;
    }
    return vehiculeLabel(vehiculeId, this.vehiculeLookups());
  });

  protected readonly keyboardRows = computed(() => {
    if (!this.plans.hasValue()) {
      return [];
    }
    return listKeyboardRows(
      this.plans.value().content,
      (plan) => `/maintenance/plans/${plan.id}`
    );
  });

  constructor() {
    connectListQueryState(
      this.route,
      this.router,
      this.destroyRef,
      { page: this.page },
      {}
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

  protected clearVehiculeFilter(): void {
    this.page.set(0);
    void this.router.navigate([], {
      queryParams: { vehiculeId: null },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }
}
