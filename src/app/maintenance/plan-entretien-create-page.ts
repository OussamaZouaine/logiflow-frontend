import { httpResource } from "@angular/common/http";
import { Component, computed, effect, inject, signal } from "@angular/core";
import {
  FormField,
  form,
  min,
  required,
  submit,
} from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import { MaintenanceTabs } from "./maintenance-tabs";
import {
  draftToWrite,
  emptyPlanEntretienDraft,
} from "./plan-entretien";
import { PlanEntretienApi } from "./plan-entretien-api";
import type { VehiculeLookup } from "./ordre-travail";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [FormField, RouterLink, MaintenanceTabs, ...FORM_PAGE_IMPORTS],
  selector: "app-plan-entretien-create-page",
  templateUrl: "./plan-entretien-create-page.html",
})
export class PlanEntretienCreatePage {
  private readonly api = inject(PlanEntretienApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

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

  protected readonly draft = signal(emptyPlanEntretienDraft());

  protected readonly createForm = form(this.draft, (path) => {
    required(path.vehiculeId, { message: "Le véhicule est obligatoire." });
    required(path.libelle, { message: "Le libellé est obligatoire." });
    min(path.seuilAlerteKm, 0, {
      message: "Le seuil ne peut pas être négatif.",
    });
    min(path.dureeEstimeeMin, 0, {
      message: "La durée ne peut pas être négative.",
    });
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
        this.toast.success("Plan d'entretien créé.");
        await this.router.navigate(["/maintenance/plans", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
