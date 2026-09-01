import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import {
  formatDateTime,
  formatMoney,
  nextStatuts,
  type OrdreTravail,
  rememberOrdre,
  type StatutOT,
  statutOtLabel,
  typeInterventionLabel,
} from "./ordre-travail";
import { OrdreTravailApi } from "./ordre-travail-api";

@Component({
  imports: [RouterLink],
  selector: "app-ordre-detail-page",
  templateUrl: "./ordre-detail-page.html",
})
export class OrdreDetailPage {
  private readonly api = inject(OrdreTravailApi);

  readonly id = input.required<string>();

  protected readonly formatDateTime = formatDateTime;
  protected readonly formatMoney = formatMoney;
  protected readonly nextStatuts = nextStatuts;
  protected readonly statutOtLabel = statutOtLabel;
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
      const updated = await this.api.changerStatut(this.id(), valeur);
      rememberOrdre(updated);
      this.ordre.reload();
    } catch (error) {
      // Second statut change 500s until OrdreTravailRepositoryAdapter
      // updates in place (same pattern as VehiculeRepositoryAdapter).
      this.statutError.set(httpErrorMessage(error));
    }
  }
}
