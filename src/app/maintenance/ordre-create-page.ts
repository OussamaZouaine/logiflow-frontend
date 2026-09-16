import { httpResource } from "@angular/common/http";
import { Component, computed, effect, inject, signal } from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import {
  draftToWrite,
  emptyOrdreDraft,
  TYPE_INTERVENTIONS,
  typeInterventionLabel,
  type VehiculeLookup,
} from "./ordre-travail";
import { OrdreTravailApi } from "./ordre-travail-api";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [FormField, RouterLink, ...FORM_PAGE_IMPORTS],
  selector: "app-ordre-create-page",
  templateUrl: "./ordre-create-page.html",
})
export class OrdreCreatePage {
  private readonly api = inject(OrdreTravailApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly types = TYPE_INTERVENTIONS;
  protected readonly typeInterventionLabel = typeInterventionLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly formError = signal<string | null>(null);

  protected readonly vehicules = httpResource<PageResponse<VehiculeLookup>>(
    () => ({
      params: { page: 0, size: LOOKUP_PAGE_SIZE },
      url: `${environment.apiBaseUrl}/vehicules`,
    })
  );

  protected readonly lookupsError = computed(() => {
    const error = this.vehicules.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly vehiculeOptions = computed(
    () => this.vehicules.value()?.content ?? []
  );

  protected readonly draft = signal(emptyOrdreDraft());

  protected readonly createForm = form(this.draft, (path) => {
    required(path.vehiculeId, { message: "Le véhicule est obligatoire." });
    required(path.type, { message: "Le type est obligatoire." });
    required(path.datePlanifiee, {
      message: "La date planifiée est obligatoire.",
    });
    min(path.montant, 0, { message: "Le montant ne peut pas être négatif." });
  });

  private seededVehiculeId = "";

  constructor() {
    effect(() => {
      const vehiculeId = this.route.snapshot.queryParamMap.get("vehiculeId");
      const options = this.vehiculeOptions();
      if (
        !vehiculeId ||
        this.seededVehiculeId === vehiculeId ||
        !options.some((entry) => entry.id === vehiculeId)
      ) {
        return;
      }
      this.seededVehiculeId = vehiculeId;
      this.draft.update((current) => ({ ...current, vehiculeId }));
    });
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.createForm, async () => {
      try {
        const created = await this.api.create(draftToWrite(this.draft()));
        this.toast.success("Ordre de travail créé.");
        await this.router.navigate(["/maintenance", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
