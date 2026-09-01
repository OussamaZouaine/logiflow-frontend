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
  emptyOrdreDraft,
  rememberOrdre,
  TYPE_INTERVENTIONS,
  typeInterventionLabel,
  type VehiculeLookup,
} from "./ordre-travail";
import { OrdreTravailApi } from "./ordre-travail-api";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [FormField, RouterLink],
  selector: "app-ordre-create-page",
  templateUrl: "./ordre-create-page.html",
})
export class OrdreCreatePage {
  private readonly api = inject(OrdreTravailApi);
  private readonly router = inject(Router);

  protected readonly types = TYPE_INTERVENTIONS;
  protected readonly typeInterventionLabel = typeInterventionLabel;
  protected readonly firstFieldError = firstFieldError;
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

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.createForm, async () => {
      try {
        const created = await this.api.create(draftToWrite(this.draft()));
        rememberOrdre(created);
        await this.router.navigate(["/maintenance", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
