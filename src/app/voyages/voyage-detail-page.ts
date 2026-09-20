import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import {
  type ChauffeurListItem,
  chauffeurLabelFromLookup,
} from "../chauffeurs/chauffeur";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import {
  type VehiculeLookup,
  vehiculeLabel,
} from "../maintenance/ordre-travail";
import type { RemorqueListItem } from "../remorques/remorque";
import { enumToSelectOptions } from "../shared/ui/field-select";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { OpsTimeline } from "../shared/ui/ops-timeline";
import { StatutChip } from "../shared/ui/statut-chip";
import { ToastService } from "../shared/ui/toast";
import { voyageStatutTone } from "../tableau/apercu";
import {
  affectationRoleLabel,
  type EvenementVoyage,
  formatInstant,
  type GeoPoint,
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
import { voyageTimelineEntries } from "./voyage-timeline";

interface DossierLink {
  id: string;
  reference: string;
}

@Component({
  imports: [RouterLink, OpsTimeline, StatutChip, ...FICHE_PAGE_IMPORTS],
  selector: "app-voyage-detail-page",
  templateUrl: "./voyage-detail-page.html",
})
export class VoyageDetailPage {
  private readonly api = inject(VoyageApi);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly affectationRoleLabel = affectationRoleLabel;
  protected readonly formatInstant = formatInstant;
  protected readonly nextStatuts = nextStatuts;
  protected readonly porteeLabel = porteeLabel;
  protected readonly remplissageLabel = remplissageLabel;
  protected readonly statutVoyageLabel = statutVoyageLabel;
  protected readonly voyageStatutTone = voyageStatutTone;
  protected readonly typeEtapeLabel = typeEtapeLabel;
  protected readonly typeEvenementLabel = typeEvenementLabel;
  protected readonly typeVoyageLabel = typeVoyageLabel;
  protected readonly eventTypes = TYPE_EVENEMENTS;
  protected readonly eventTypeOptions = enumToSelectOptions(
    TYPE_EVENEMENTS,
    typeEvenementLabel
  );

  protected readonly statutError = signal<string | null>(null);
  protected readonly eventError = signal<string | null>(null);
  protected readonly eventType = signal<TypeEvenement>("DEPART");
  protected readonly eventComment = signal("");
  protected readonly eventLatitude = signal("");
  protected readonly eventLongitude = signal("");

  protected readonly voyage = httpResource<Voyage>(() => ({
    url: `${environment.apiBaseUrl}/voyages/${this.id()}`,
  }));

  protected readonly vehicules = httpResource<PageResponse<VehiculeLookup>>(
    () => ({
      params: { page: 0, size: 50 },
      url: `${environment.apiBaseUrl}/vehicules`,
    })
  );

  protected readonly remorques = httpResource<PageResponse<RemorqueListItem>>(
    () => ({
      params: { page: 0, size: 50 },
      url: `${environment.apiBaseUrl}/remorques`,
    })
  );

  protected readonly chauffeurs = httpResource<PageResponse<ChauffeurListItem>>(
    () => ({
      params: { page: 0, size: 50 },
      url: `${environment.apiBaseUrl}/chauffeurs`,
    })
  );

  protected readonly chauffeursById = computed(() => {
    const map = new Map<
      string,
      Pick<ChauffeurListItem, "matricule" | "nom" | "prenom">
    >();
    for (const chauffeur of this.chauffeurs.value()?.content ?? []) {
      map.set(chauffeur.id, chauffeur);
    }
    return map;
  });

  protected readonly dossiers = httpResource<PageResponse<DossierLink>>(() => ({
    params: { page: 0, size: 50 },
    url: `${environment.apiBaseUrl}/dossiers`,
  }));

  protected readonly dossiersById = computed(() => {
    const map = new Map<string, DossierLink>();
    for (const dossier of this.dossiers.value()?.content ?? []) {
      map.set(dossier.id, dossier);
    }
    return map;
  });

  protected readonly evenements = httpResource<EvenementVoyage[]>(() => ({
    url: `${environment.apiBaseUrl}/voyages/${this.id()}/evenements`,
  }));

  protected readonly timelineEntries = computed(() => {
    const voyage = this.voyage.value();
    if (!voyage) {
      return [];
    }
    return voyageTimelineEntries(
      voyage,
      this.evenements.value() ?? [],
      (chauffeurId) =>
        chauffeurLabelFromLookup(chauffeurId, this.chauffeursById())
    );
  });

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.voyage.error())
  );

  protected readonly eventsError = computed(() => {
    const error = this.evenements.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected dossierLabel(dossierId: string): string {
    return this.dossiersById().get(dossierId)?.reference ?? dossierId;
  }

  protected titulaireChauffeurId(): string | null {
    const voyage = this.voyage.value();
    if (!voyage) {
      return null;
    }
    return (
      voyage.affectations.find(
        (affectation) => affectation.role === "TITULAIRE"
      )?.chauffeurId ??
      voyage.affectations[0]?.chauffeurId ??
      null
    );
  }

  protected chauffeurLabel(chauffeurId: string): string {
    return chauffeurLabelFromLookup(chauffeurId, this.chauffeursById());
  }

  protected affectedVehiculeLabel(): string {
    const voyage = this.voyage.value();
    if (!voyage) {
      return "";
    }
    return vehiculeLabel(
      voyage.vehiculeId,
      this.vehicules.value()?.content ?? []
    );
  }

  protected affectedRemorqueLabel(remorqueId: string): string {
    const remorque = this.remorques
      .value()
      ?.content.find((entry) => entry.id === remorqueId);
    return remorque?.immatriculation ?? remorqueId;
  }

  protected onEventType(value: string): void {
    if (isTypeEvenement(value)) {
      this.eventType.set(value);
    }
  }

  protected onEventComment(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.eventComment.set(target.value);
    }
  }

  protected onEventLatitude(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.eventLatitude.set(target.value);
    }
  }

  protected onEventLongitude(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.eventLongitude.set(target.value);
    }
  }

  protected useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.eventError.set(
        "La géolocalisation n'est pas disponible sur ce navigateur."
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.eventLatitude.set(String(position.coords.latitude));
        this.eventLongitude.set(String(position.coords.longitude));
        this.eventError.set(null);
      },
      () => {
        this.eventError.set("Impossible d'obtenir la position actuelle.");
      }
    );
  }

  protected async changerStatut(valeur: StatutVoyage): Promise<void> {
    this.statutError.set(null);
    try {
      await this.api.changerStatut(this.id(), valeur);
      this.voyage.reload();
      this.toast.success("Statut du voyage mis à jour.");
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
    const position = this.parseEventPosition();
    if (position === undefined) {
      return;
    }
    try {
      await this.api.declarerEvenement({
        commentaire: commentaire.length > 0 ? commentaire : null,
        horodatage: new Date().toISOString(),
        position,
        type: this.eventType(),
        voyageId: this.id(),
      });
      this.eventComment.set("");
      this.eventLatitude.set("");
      this.eventLongitude.set("");
      this.evenements.reload();
      this.toast.success("Événement enregistré.");
    } catch (error) {
      this.eventError.set(httpErrorMessage(error));
    }
  }

  private parseEventPosition(): GeoPoint | null | undefined {
    const latRaw = this.eventLatitude().trim();
    const lngRaw = this.eventLongitude().trim();
    if (latRaw.length === 0 && lngRaw.length === 0) {
      return null;
    }
    const latitude = Number(latRaw);
    const longitude = Number(lngRaw);
    if (Number.isNaN(latitude) || latRaw.length === 0) {
      this.eventError.set("La latitude doit être un nombre valide.");
      return undefined;
    }
    if (Number.isNaN(longitude) || lngRaw.length === 0) {
      this.eventError.set("La longitude doit être un nombre valide.");
      return undefined;
    }
    if (latitude < -90 || latitude > 90) {
      this.eventError.set("La latitude doit être comprise entre -90 et 90.");
      return undefined;
    }
    if (longitude < -180 || longitude > 180) {
      this.eventError.set("La longitude doit être comprise entre -180 et 180.");
      return undefined;
    }
    return { latitude, longitude };
  }
}
