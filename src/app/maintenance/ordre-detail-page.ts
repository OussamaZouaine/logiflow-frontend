import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { ToastService } from "../shared/ui/toast";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  formatDateTime,
  formatDureeReelleMin,
  formatMoney,
  formatOrdreShortId,
  nextStatuts,
  type OrdreTravail,
  type StatutOT,
  statutOtLabel,
  statutOtTone,
  typeInterventionLabel,
  type VehiculeLookup,
  vehiculeLabel,
} from "./ordre-travail";
import { OrdreTravailApi } from "./ordre-travail-api";

const VEHICULE_LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [RouterLink, StatutChip, ...FICHE_PAGE_IMPORTS],
  selector: "app-ordre-detail-page",
  templateUrl: "./ordre-detail-page.html",
})
export class OrdreDetailPage {
  private readonly api = inject(OrdreTravailApi);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly formatDateTime = formatDateTime;
  protected readonly formatDureeReelleMin = formatDureeReelleMin;
  protected readonly formatMoney = formatMoney;
  protected readonly formatOrdreShortId = formatOrdreShortId;
  protected readonly nextStatuts = nextStatuts;
  protected readonly statutOtLabel = statutOtLabel;
  protected readonly statutOtTone = statutOtTone;
  protected readonly typeInterventionLabel = typeInterventionLabel;

  protected readonly statutError = signal<string | null>(null);

  protected readonly ordre = httpResource<OrdreTravail>(() => ({
    url: `${environment.apiBaseUrl}/ordres-travail/${this.id()}`,
  }));

  protected readonly vehicules = httpResource<PageResponse<VehiculeLookup>>(
    () => ({
      params: { page: 0, size: VEHICULE_LOOKUP_PAGE_SIZE },
      url: `${environment.apiBaseUrl}/vehicules`,
    })
  );

  protected readonly vehiculeLookups = computed(
    () => this.vehicules.value()?.content ?? []
  );

  protected readonly vehiculeDisplay = computed(() => {
    const ordre = this.ordre.value();
    if (!ordre) {
      return { id: "", label: "" };
    }
    return {
      id: ordre.vehiculeId,
      label: vehiculeLabel(ordre.vehiculeId, this.vehiculeLookups()),
    };
  });

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.ordre.error())
  );

  protected readonly vehiculeLoadError = computed(() => {
    const error = this.vehicules.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected async changerStatut(valeur: StatutOT): Promise<void> {
    this.statutError.set(null);
    try {
      await this.api.changerStatut(this.id(), valeur);
      this.ordre.reload();
      this.toast.success("Statut de l'ordre mis à jour.");
    } catch (error) {
      this.statutError.set(httpErrorMessage(error));
    }
  }
}
