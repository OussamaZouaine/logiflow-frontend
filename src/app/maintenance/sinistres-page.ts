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
  formatDateHeure,
  formatMontant,
  libelle,
  parametresRequete,
  type Sinistre,
  STATUTS_SINISTRE,
  TYPES_SINISTRE,
  toneStatutSinistre,
} from "./maintenance";
import { creerLookupsMaintenance } from "./maintenance-lookups";
import { MaintenanceTabs } from "./maintenance-tabs";

/** Liste des sinistres avec coût net et alertes de déclaration tardive. */
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
  selector: "app-sinistres-page",
  templateUrl: "./sinistres-page.html",
})
export class SinistresPage {
  protected readonly lookups = creerLookupsMaintenance();
  protected readonly libelle = libelle;
  protected readonly formatMontant = formatMontant;
  protected readonly formatDateHeure = formatDateHeure;
  protected readonly toneStatutSinistre = toneStatutSinistre;

  protected readonly statutOptions = withNoneSelectOption(
    "Tous les statuts",
    enumToSelectOptions(STATUTS_SINISTRE, libelle)
  );
  protected readonly typeOptions = withNoneSelectOption(
    "Tous les types",
    enumToSelectOptions(TYPES_SINISTRE, libelle)
  );

  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly statut = signal("");
  protected readonly type = signal("");
  protected readonly page = signal(0);

  protected readonly sinistres = httpResource<PageResponse<Sinistre>>(() => {
    const params = parametresRequete({
      page: this.page(),
      q: this.search(),
      size: 20,
      statut: this.statut(),
      type: this.type(),
    });
    return { params, url: `${environment.apiBaseUrl}/maintenance/sinistres` };
  });

  protected readonly erreur = computed(() =>
    httpErrorMessage(this.sinistres.error())
  );

  constructor() {
    effect(() => {
      this.search();
      this.statut();
      this.type();
      untracked(() => this.page.set(0));
    });
  }

  protected engins(s: Sinistre): string {
    return [s.vehiculeId, s.remorqueId]
      .filter((id): id is string => Boolean(id))
      .map((id) => this.lookups.engins().get(id)?.immatriculation ?? "…")
      .join(" + ");
  }
}
