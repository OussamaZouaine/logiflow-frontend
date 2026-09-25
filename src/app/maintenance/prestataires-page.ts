import { httpResource } from "@angular/common/http";
import { Component, computed, effect, signal, untracked } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import {
  enumToSelectOptions,
  FieldSelectComponent,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListSearchBar } from "../shared/ui/list-search-bar";
import { ListTableSkeleton } from "../shared/ui/list-table-skeleton";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  libelle,
  type Prestataire,
  parametresRequete,
  TYPES_PRESTATAIRE,
} from "./maintenance";
import { MaintenanceTabs } from "./maintenance-tabs";

/** Répertoire des prestataires (garages, carrossiers, experts, assureurs…). */
@Component({
  imports: [
    RouterLink,
    StatutChip,
    FieldSelectComponent,
    ListSearchBar,
    ListPagination,
    ListEmptyState,
    ListTableSkeleton,
    MaintenanceTabs,
  ],
  selector: "app-prestataires-page",
  templateUrl: "./prestataires-page.html",
})
export class PrestatairesPage {
  protected readonly libelle = libelle;
  protected readonly typeOptions = withNoneSelectOption(
    "Tous les métiers",
    enumToSelectOptions(TYPES_PRESTATAIRE, libelle)
  );

  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly type = signal("");
  protected readonly page = signal(0);

  protected readonly prestataires = httpResource<PageResponse<Prestataire>>(
    () => {
      const params = parametresRequete({
        page: this.page(),
        q: this.search(),
        size: 20,
        type: this.type(),
      });
      return {
        params,
        url: `${environment.apiBaseUrl}/maintenance/prestataires`,
      };
    }
  );

  protected readonly erreur = computed(() =>
    httpErrorMessage(this.prestataires.error())
  );

  constructor() {
    effect(() => {
      this.search();
      this.type();
      untracked(() => this.page.set(0));
    });
  }
}
