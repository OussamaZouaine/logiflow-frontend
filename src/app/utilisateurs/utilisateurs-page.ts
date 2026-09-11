import { httpResource } from "@angular/common/http";
import { Component, computed, effect, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { filterByStatut } from "../shared/ui/list-filter";
import { ListEmptyState } from "../shared/ui/list-empty-state";
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
import { formatRoles, type Utilisateur } from "./utilisateur";

const UTILISATEURS_PAGE_SIZE = 20;

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
  ],
  selector: "app-utilisateurs-page",
  templateUrl: "./utilisateurs-page.html",
})
export class UtilisateursPage {
  protected readonly actifLabel = actifLabel;
  protected readonly actifTone = actifTone;
  protected readonly formatRoles = formatRoles;
  protected readonly actifOptions = ACTIF_OPTIONS;
  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly actifFilter = signal<string | null>(null);
  protected readonly page = signal(0);

  protected readonly utilisateurs = httpResource<PageResponse<Utilisateur>>(
    () => ({
      params: {
        page: this.page(),
        q: this.search().trim(),
        size: UTILISATEURS_PAGE_SIZE,
      },
      url: `${environment.apiBaseUrl}/utilisateurs`,
    })
  );

  protected readonly visibleUtilisateurs = computed(() => {
    const page = this.utilisateurs.value();
    if (!page) {
      return [];
    }
    return filterByStatut(page.content, this.actifFilter(), (utilisateur) =>
      utilisateur.actif ? "true" : "false"
    );
  });

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.utilisateurs.error())
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
    this.actifFilter.set(null);
    this.page.set(0);
  }
}
