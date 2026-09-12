import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { ToastService } from "../shared/ui/toast";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { validateTimeWindowEndAfterStart } from "../core/forms/time-window-validation";
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly types = TYPE_VOYAGES;
  protected readonly portees = PORTEES;
  protected readonly typeVoyageLabel = typeVoyageLabel;
  protected readonly porteeLabel = porteeLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly formError = signal<string | null>(null);
  protected readonly dossierSelectionError = signal<string | null>(null);

  protected readonly selectedDossierIds = signal<string[]>(
    this.initialDossierSelection()
  );

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

  protected readonly dossierOptions = computed(() =>
    (this.dossiers.value()?.content ?? []).filter(
      (dossier) => dossier.statut === "CREE"
    )
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
    required(path.chauffeurId, { message: "Le chauffeur est obligatoire." });
    min(path.distanceTotaleKm, 0, {
      message: "La distance ne peut pas être négative.",
    });
    min(path.dureeConduiteMin, 0, {
      message: "La durée de conduite ne peut pas être négative.",
    });
    validateTimeWindowEndAfterStart(
      path.arriveePrevue,
      path.departPrevu,
      "L'arrivée prévue doit être postérieure au départ prévu."
    );
  });

  protected isDossierSelected(id: string): boolean {
    return this.selectedDossierIds().includes(id);
  }

  protected toggleDossier(id: string, checked: boolean): void {
    this.dossierSelectionError.set(null);
    this.selectedDossierIds.update((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }
      return current.filter((value) => value !== id);
    });
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    this.dossierSelectionError.set(null);

    if (this.selectedDossierIds().length === 0) {
      this.dossierSelectionError.set(
        "Sélectionnez au moins un dossier au statut Créé."
      );
      return;
    }

    await submit(this.createForm, async () => {
      try {
        const created = await this.api.create(
          draftToWrite(this.draft(), this.selectedDossierIds())
        );
        this.toast.success("Voyage créé.");
        await this.router.navigate(["/voyages", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }

  private initialDossierSelection(): string[] {
    const dossierId = this.route.snapshot.queryParamMap.get("dossierId");
    return dossierId && dossierId.length > 0 ? [dossierId] : [];
  }
}
