import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import {
  draftToWrite,
  emptyVoyageDraft,
  PORTEES,
  porteeLabel,
  TYPE_VOYAGES,
  typeVoyageLabel,
  type VoyageLookupChauffeur,
  type VoyageLookupDossier,
  type VoyageLookupVehicule,
} from "./voyage";
import { VoyageApi } from "./voyage-api";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [FormField, RouterLink],
  selector: "app-voyage-create-page",
  templateUrl: "./voyage-create-page.html",
})
export class VoyageCreatePage {
  private readonly api = inject(VoyageApi);
  private readonly router = inject(Router);

  protected readonly types = TYPE_VOYAGES;
  protected readonly portees = PORTEES;
  protected readonly typeVoyageLabel = typeVoyageLabel;
  protected readonly porteeLabel = porteeLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly formError = signal<string | null>(null);

  protected readonly vehicules = httpResource<
    PageResponse<VoyageLookupVehicule>
  >(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/vehicules`,
  }));

  protected readonly dossiers = httpResource<PageResponse<VoyageLookupDossier>>(
    () => ({
      params: { page: 0, size: LOOKUP_PAGE_SIZE },
      url: `${environment.apiBaseUrl}/dossiers`,
    })
  );

  protected readonly chauffeurs = httpResource<
    PageResponse<VoyageLookupChauffeur>
  >(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/chauffeurs`,
  }));

  protected readonly lookupsError = computed(() => {
    const vehiculeError = this.vehicules.error();
    if (vehiculeError) {
      return httpErrorMessage(vehiculeError);
    }
    const dossierError = this.dossiers.error();
    if (dossierError) {
      return httpErrorMessage(dossierError);
    }
    const chauffeurError = this.chauffeurs.error();
    if (chauffeurError) {
      return httpErrorMessage(chauffeurError);
    }
    return null;
  });

  protected readonly lookupsReady = computed(
    () =>
      this.vehicules.hasValue() &&
      this.dossiers.hasValue() &&
      this.chauffeurs.hasValue()
  );

  protected readonly vehiculeOptions = computed(
    () => this.vehicules.value()?.content ?? []
  );

  protected readonly dossierOptions = computed(
    () => this.dossiers.value()?.content ?? []
  );

  protected readonly chauffeurOptions = computed(
    () => this.chauffeurs.value()?.content ?? []
  );

  protected readonly draft = signal(emptyVoyageDraft());

  protected readonly createForm = form(this.draft, (path) => {
    required(path.typeVoyage, { message: "Le type est obligatoire." });
    required(path.portee, { message: "La portée est obligatoire." });
    required(path.departPrevu, { message: "Le départ prévu est obligatoire." });
    required(path.arriveePrevue, {
      message: "L'arrivée prévue est obligatoire.",
    });
    required(path.vehiculeId, { message: "Le véhicule est obligatoire." });
    required(path.dossierId, { message: "Le dossier est obligatoire." });
    required(path.chauffeurId, { message: "Le chauffeur est obligatoire." });
    min(path.distanceTotaleKm, 0, {
      message: "La distance ne peut pas être négative.",
    });
    min(path.dureeConduiteMin, 0, {
      message: "La durée de conduite ne peut pas être négative.",
    });
  });

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.createForm, async () => {
      const draft = this.draft();
      if (new Date(draft.arriveePrevue) <= new Date(draft.departPrevu)) {
        this.formError.set(
          "L'arrivée prévue doit être postérieure au départ prévu."
        );
        return;
      }
      try {
        const created = await this.api.create(draftToWrite(draft));
        await this.router.navigate(["/voyages", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
