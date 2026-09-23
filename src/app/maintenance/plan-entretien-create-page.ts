import { httpResource } from "@angular/common/http";
import { Component, computed, effect, inject, signal } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import {
  FormField,
  form,
  min,
  required,
  submit,
  validate,
} from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { type FieldSelectOption } from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import { MaintenanceTabs } from "./maintenance-tabs";
import {
  draftToWrite,
  emptyPlanEntretienDraft,
  hasPlanPeriodicite,
} from "./plan-entretien";
import { PlanEntretienApi } from "./plan-entretien-api";
import type { VehiculeLookup } from "./ordre-travail";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [
    FormField,
    NgIcon,
    RouterLink,
    MaintenanceTabs,
    ...FORM_PAGE_IMPORTS,
  ],
  selector: "app-plan-entretien-create-page",
  templateUrl: "./plan-entretien-create-page.html",
  viewProviders: [provideIcons({ lucideCheck })],
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

  protected readonly vehiculeSelectOptions = computed<
    readonly FieldSelectOption[]
  >(() =>
    this.vehiculeOptions().map((vehicule) => ({
      label: vehicule.immatriculation,
      value: vehicule.id,
    }))
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

    validate(path.periodiciteKm, (ctx) => {
      const km = ctx.value();
      if (km != null && km <= 0) {
        return {
          kind: "periodiciteKm",
          message: "La périodicité km doit être strictement positive.",
        };
      }
      const mois = ctx.valueOf(path.periodiciteMois);
      if (!hasPlanPeriodicite(km, mois)) {
        return {
          kind: "periodicite",
          message:
            "Indiquez au moins une périodicité en kilomètres ou en mois.",
        };
      }
      return undefined;
    });

    validate(path.periodiciteMois, (ctx) => {
      const mois = ctx.value();
      if (mois != null && mois <= 0) {
        return {
          kind: "periodiciteMois",
          message: "La périodicité en mois doit être strictement positive.",
        };
      }
      const km = ctx.valueOf(path.periodiciteKm);
      if (!hasPlanPeriodicite(km, mois)) {
        return {
          kind: "periodicite",
          message:
            "Indiquez au moins une périodicité en kilomètres ou en mois.",
        };
      }
      return undefined;
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
