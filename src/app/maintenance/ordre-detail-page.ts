import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { FicheHeader } from "../shared/ui/fiche-header";
import { ToastService } from "../shared/ui/toast";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  formatDateTime,
  formatMoney,
  nextStatuts,
  type OrdreTravail,
  type StatutOT,
  statutOtLabel,
  statutOtTone,
  typeInterventionLabel,
} from "./ordre-travail";
import { OrdreTravailApi } from "./ordre-travail-api";

@Component({
  imports: [FicheHeader, StatutChip],
  selector: "app-ordre-detail-page",
  templateUrl: "./ordre-detail-page.html",
})
export class OrdreDetailPage {
  private readonly api = inject(OrdreTravailApi);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly formatDateTime = formatDateTime;
  protected readonly formatMoney = formatMoney;
  protected readonly nextStatuts = nextStatuts;
  protected readonly statutOtLabel = statutOtLabel;
  protected readonly statutOtTone = statutOtTone;
  protected readonly typeInterventionLabel = typeInterventionLabel;

  protected readonly statutError = signal<string | null>(null);

  protected readonly ordre = httpResource<OrdreTravail>(() => ({
    url: `${environment.apiBaseUrl}/ordres-travail/${this.id()}`,
  }));

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.ordre.error())
  );

  protected async changerStatut(valeur: StatutOT): Promise<void> {
    this.statutError.set(null);
    try {
      await this.api.changerStatut(this.id(), valeur);
      this.ordre.reload();
      this.toast.success("Statut de l'ordre mis à jour.");
    } catch (error) {
      // Second statut change 500s until OrdreTravailRepositoryAdapter
      // updates in place (same pattern as VehiculeRepositoryAdapter).
      this.statutError.set(httpErrorMessage(error));
    }
  }
}
