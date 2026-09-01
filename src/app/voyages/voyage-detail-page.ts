import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import {
  type EvenementVoyage,
  formatInstant,
  isTypeEvenement,
  nextStatuts,
  porteeLabel,
  remplissageLabel,
  type StatutVoyage,
  statutVoyageLabel,
  TYPE_EVENEMENTS,
  type TypeEvenement,
  typeEtapeLabel,
  typeEvenementLabel,
  typeVoyageLabel,
  type Voyage,
} from "./voyage";
import { VoyageApi } from "./voyage-api";

@Component({
  imports: [RouterLink],
  selector: "app-voyage-detail-page",
  templateUrl: "./voyage-detail-page.html",
})
export class VoyageDetailPage {
  private readonly api = inject(VoyageApi);

  readonly id = input.required<string>();

  protected readonly formatInstant = formatInstant;
  protected readonly nextStatuts = nextStatuts;
  protected readonly porteeLabel = porteeLabel;
  protected readonly remplissageLabel = remplissageLabel;
  protected readonly statutVoyageLabel = statutVoyageLabel;
  protected readonly typeEtapeLabel = typeEtapeLabel;
  protected readonly typeEvenementLabel = typeEvenementLabel;
  protected readonly typeVoyageLabel = typeVoyageLabel;
  protected readonly eventTypes = TYPE_EVENEMENTS;

  protected readonly statutError = signal<string | null>(null);
  protected readonly eventError = signal<string | null>(null);
  protected readonly eventType = signal<TypeEvenement>("DEPART");
  protected readonly eventComment = signal("");

  protected readonly voyage = httpResource<Voyage>(() => ({
    url: `${environment.apiBaseUrl}/voyages/${this.id()}`,
  }));

  protected readonly evenements = httpResource<EvenementVoyage[]>(() => ({
    url: `${environment.apiBaseUrl}/voyages/${this.id()}/evenements`,
  }));

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.voyage.error())
  );

  protected readonly eventsError = computed(() => {
    const error = this.evenements.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected onEventType(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLSelectElement && isTypeEvenement(target.value)) {
      this.eventType.set(target.value);
    }
  }

  protected onEventComment(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.eventComment.set(target.value);
    }
  }

  protected async changerStatut(valeur: StatutVoyage): Promise<void> {
    this.statutError.set(null);
    try {
      await this.api.changerStatut(this.id(), valeur);
      this.voyage.reload();
    } catch (error) {
      // Second statut change 500s until VoyageRepositoryAdapter updates
      // in place (same pattern as VehiculeRepositoryAdapter).
      this.statutError.set(httpErrorMessage(error));
    }
  }

  protected async declarerEvenement(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.eventError.set(null);
    const commentaire = this.eventComment().trim();
    try {
      await this.api.declarerEvenement({
        commentaire: commentaire.length > 0 ? commentaire : null,
        horodatage: new Date().toISOString(),
        type: this.eventType(),
        voyageId: this.id(),
      });
      this.eventComment.set("");
      this.evenements.reload();
    } catch (error) {
      this.eventError.set(httpErrorMessage(error));
    }
  }
}
