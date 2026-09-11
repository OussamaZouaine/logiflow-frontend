import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { DemoSessionService } from "../core/auth/demo-session";
import { DOSSIERS_PLAN_ROLES } from "../core/auth/role";
import { filterByStatut, statutOptionsFrom } from "../shared/ui/list-filter";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListStatutFilter } from "../shared/ui/list-statut-filter";
import { StatutChip } from "../shared/ui/statut-chip";
import { dossierStatutTone } from "../tableau/apercu";
import {
  type Dossier,
  STATUT_DOSSIERS,
  statutDossierLabel,
  typeTransportLabel,
} from "./dossier";

const DOSSIERS_PAGE_SIZE = 20;

@Component({
  imports: [
    RouterLink,
    StatutChip,
    ListStatutFilter,
    ListPagination,
    ListEmptyState,
  ],
  selector: "app-dossiers-page",
  templateUrl: "./dossiers-page.html",
})
export class DossiersPage {
  private readonly session = inject(DemoSessionService);

  protected readonly statutDossierLabel = statutDossierLabel;
  protected readonly dossierStatutTone = dossierStatutTone;
  protected readonly typeTransportLabel = typeTransportLabel;
  protected readonly statutOptions = statutOptionsFrom(
    STATUT_DOSSIERS,
    statutDossierLabel
  );
  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);

  protected readonly canPlan = computed(() =>
    this.session.hasAnyRole(DOSSIERS_PLAN_ROLES)
  );

  protected readonly dossiers = httpResource<PageResponse<Dossier>>(() => ({
    params: {
      page: this.page(),
      size: DOSSIERS_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/dossiers`,
  }));

  protected readonly visibleDossiers = computed(() => {
    const page = this.dossiers.value();
    if (!page) {
      return [];
    }
    return filterByStatut(
      page.content,
      this.statutFilter(),
      (dossier) => dossier.statut
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.dossiers.error())
  );

  protected clearFilters(): void {
    this.statutFilter.set(null);
  }
}
