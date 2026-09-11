import { httpResource } from "@angular/common/http";
import { Component, computed, effect, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { filterByStatut, statutOptionsFrom } from "../shared/ui/list-filter";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListSearchBar } from "../shared/ui/list-search-bar";
import { ListStatutFilter } from "../shared/ui/list-statut-filter";
import { StatutChip } from "../shared/ui/statut-chip";
import { vehiculeStatutTone } from "../tableau/apercu";
import {
  statutLabel,
  typeLabel,
  type Vehicule,
  VEHICULE_STATUTS,
} from "./vehicule";

const VEHICULES_PAGE_SIZE = 20;

@Component({
  imports: [
    RouterLink,
    StatutChip,
    ListSearchBar,
    ListStatutFilter,
    ListPagination,
    ListEmptyState,
  ],
  selector: "app-vehicules-page",
  templateUrl: "./vehicules-page.html",
})
export class VehiculesPage {
  protected readonly typeLabel = typeLabel;
  protected readonly statutLabel = statutLabel;
  protected readonly vehiculeStatutTone = vehiculeStatutTone;
  protected readonly statutOptions = statutOptionsFrom(
    VEHICULE_STATUTS,
    statutLabel
  );

  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly statutFilter = signal<string | null>(null);
  protected readonly page = signal(0);

  protected readonly vehicules = httpResource<PageResponse<Vehicule>>(() => ({
    params: {
      page: this.page(),
      q: this.search().trim(),
      size: VEHICULES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/vehicules`,
  }));

  protected readonly visibleVehicules = computed(() => {
    const page = this.vehicules.value();
    if (!page) {
      return [];
    }
    return filterByStatut(
      page.content,
      this.statutFilter(),
      (vehicule) => vehicule.statut
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.vehicules.error())
  );

  constructor() {
    effect(() => {
      this.search();
      this.page.set(0);
    });
  }

  protected clearFilters(): void {
    this.searchDraft.set("");
    this.search.set("");
    this.statutFilter.set(null);
    this.page.set(0);
  }
}
