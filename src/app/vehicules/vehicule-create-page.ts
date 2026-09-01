import { Component, inject, signal } from "@angular/core";
import {
  FormField,
  form,
  min,
  pattern,
  required,
  submit,
} from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { httpErrorMessage } from "../core/api/http-error";
import { firstFieldError } from "../core/forms/first-field-error";
import { typeLabel, VEHICULE_TYPES, type VehiculeType } from "./vehicule";
import { VehiculeApi } from "./vehicule-api";

const IMMAT_PATTERN = /^[A-Za-z]{2}-\d{3}-[A-Za-z]{2}$/;

@Component({
  imports: [FormField, RouterLink],
  selector: "app-vehicule-create-page",
  templateUrl: "./vehicule-create-page.html",
})
export class VehiculeCreatePage {
  private readonly api = inject(VehiculeApi);
  private readonly router = inject(Router);

  protected readonly types = VEHICULE_TYPES;
  protected readonly typeLabel = typeLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly formError = signal<string | null>(null);

  protected readonly draft = signal({
    chargeUtileKg: 9000,
    immatriculation: "",
    ptacKg: 19_000,
    type: "TRACTEUR" as VehiculeType,
  });

  protected readonly createForm = form(this.draft, (path) => {
    required(path.immatriculation, {
      message: "L'immatriculation est obligatoire.",
    });
    pattern(path.immatriculation, IMMAT_PATTERN, {
      message: "Format attendu : AA-123-AA.",
    });
    required(path.type, { message: "Le type est obligatoire." });
    min(path.ptacKg, 1, { message: "Le PTAC doit être positif." });
    min(path.chargeUtileKg, 1, {
      message: "La charge utile doit être positive.",
    });
  });

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.createForm, async () => {
      const draft = this.draft();
      try {
        const created = await this.api.create({
          chargeUtileKg: draft.chargeUtileKg,
          documents: [],
          immatriculation: draft.immatriculation.trim().toUpperCase(),
          ptacKg: draft.ptacKg,
          type: draft.type,
        });
        await this.router.navigate(["/vehicules", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
