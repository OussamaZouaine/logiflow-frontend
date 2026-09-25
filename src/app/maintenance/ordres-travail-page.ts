import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  effect,
  input,
  signal,
  untracked,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import {
  enumToSelectOptions,
  FieldSelectComponent,
  isFieldSelectNone,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { DEFAULT_LIST_PAGE_SIZE } from "../shared/ui/list-page-size";
import { ListPagination } from "../shared/ui/list-pagination";
import { ListSearchBar } from "../shared/ui/list-search-bar";
import { ListTableSkeleton } from "../shared/ui/list-table-skeleton";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  formatDateHeure,
  formatEur,
  libelle,
  libelleEngin,
  NATURES,
  type OrdreTravail,
  parametresRequete,
  STATUTS_OT,
  TYPES_ENGIN,
  TYPES_INTERVENTION,
  toneStatutOT,
} from "./maintenance";
import { creerLookupsMaintenance } from "./maintenance-lookups";
import { MaintenanceTabs } from "./maintenance-tabs";

/** Liste filtrable des ordres de travail. */
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
  selector: "app-ordres-travail-page",
  templateUrl: "./ordres-travail-page.html",
})
export class OrdresTravailPage {
  /** Filtre facultatif sur un engin (paramètre de requête, depuis les coûts ou une fiche). */
  readonly enginId = input<string>();

  protected readonly lookups = creerLookupsMaintenance();
  protected readonly libelle = libelle;
  protected readonly libelleEngin = libelleEngin;
  protected readonly formatEur = formatEur;
  protected readonly formatDateHeure = formatDateHeure;
  protected readonly toneStatutOT = toneStatutOT;

  protected readonly statutOptions = withNoneSelectOption(
    "Tous les statuts",
    enumToSelectOptions(STATUTS_OT, libelle)
  );
  protected readonly typeOptions = withNoneSelectOption(
    "Tous les types",
    enumToSelectOptions(TYPES_INTERVENTION, libelle)
  );
  protected readonly natureOptions = withNoneSelectOption(
    "Toutes natures",
    enumToSelectOptions(NATURES, libelle)
  );
  protected readonly enginTypeOptions = withNoneSelectOption(
    "Tous les engins",
    enumToSelectOptions(TYPES_ENGIN, libelle)
  );

  protected readonly searchDraft = signal("");
  protected readonly search = signal("");
  protected readonly statut = signal("");
  protected readonly type = signal("");
  protected readonly nature = signal("");
  protected readonly typeEngin = signal("");
  protected readonly page = signal(0);
  protected readonly pageSize = signal(DEFAULT_LIST_PAGE_SIZE);

  protected readonly ordres = httpResource<PageResponse<OrdreTravail>>(() => {
    const params = parametresRequete({
      enginId: this.enginId(),
      nature: this.nature(),
      page: this.page(),
      q: this.search(),
      size: this.pageSize(),
      statut: this.statut(),
      type: this.type(),
      typeEngin: this.typeEngin(),
    });
    return {
      params,
      url: `${environment.apiBaseUrl}/maintenance/ordres-travail`,
    };
  });

  protected readonly filtresActifs = computed(
    () =>
      Boolean(this.search().trim()) ||
      [this.statut(), this.type(), this.nature(), this.typeEngin()].some(
        (v) => v && !isFieldSelectNone(v)
      )
  );
  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.ordres.error())
  );

  constructor() {
    // Retour en première page à chaque changement de filtre.
    effect(() => {
      this.search();
      this.statut();
      this.type();
      this.nature();
      this.typeEngin();
      untracked(() => this.page.set(0));
    });
  }

  protected reinitialiser(): void {
    this.searchDraft.set("");
    this.search.set("");
    this.statut.set("");
    this.type.set("");
    this.nature.set("");
    this.typeEngin.set("");
  }

  protected changerTaillePage(taille: number): void {
    this.pageSize.set(taille);
    this.page.set(0);
  }
}
