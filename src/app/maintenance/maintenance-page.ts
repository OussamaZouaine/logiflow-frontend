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
import { connectListQueryState } from "../shared/ui/list-query-state";
import {
  listKeyboardRows,
  ListRowKeyboard,
  syncListKeyboardActiveId,
} from "../shared/ui/list-row-keyboard";
import { ListStatutFilter } from "../shared/ui/list-statut-filter";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  formatDateTime,
  formatMoney,
  STATUT_OT,
  statutOtLabel,
  statutOtTone,
  type OrdreTravail,
  typeInterventionLabel,
} from "./ordre-travail";

const ORDRES_PAGE_SIZE = 20;

@Component({
  imports: [
    RouterLink,
    StatutChip,
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
  protected readonly statutOtLabel = statutOtLabel;
  protected readonly statutOtTone = statutOtTone;
  protected readonly typeInterventionLabel = typeInterventionLabel;
  protected readonly statutOptions = statutOptionsFrom(
    STATUT_OT,
    statutOtLabel
  );

  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly activeRowId = signal<string | null>(null);

  protected readonly ordres = httpResource<PageResponse<OrdreTravail>>(() => ({
    params: { page: this.page(), size: ORDRES_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/ordres-travail`,
  }));

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

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.ordres.error())
  );

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

    effect(() => {
      syncListKeyboardActiveId(this.keyboardRows(), this.activeRowId);
    });
  }

  protected clearFilters(): void {
    this.statutFilter.set(null);
    this.page.set(0);
  }
}
