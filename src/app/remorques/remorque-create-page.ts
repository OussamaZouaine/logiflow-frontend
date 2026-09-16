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
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import {
  CARROSSERIES_REQUISES,
  carrosserieRequiseLabel,
  draftToWrite,
  emptyRemorqueDraft,
} from "./remorque";
import { RemorqueApi } from "./remorque-api";

const IMMAT_PATTERN = /^[A-Za-z]{2}-\d{3}-[A-Za-z]{2}$/;

@Component({
  imports: [FormField, RouterLink, ...FORM_PAGE_IMPORTS],
  selector: "app-remorque-create-page",
  templateUrl: "./remorque-create-page.html",
})
export class RemorqueCreatePage {
  private readonly api = inject(RemorqueApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly carrosseries = CARROSSERIES_REQUISES;
  protected readonly carrosserieRequiseLabel = carrosserieRequiseLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly formError = signal<string | null>(null);

  protected readonly draft = signal(emptyRemorqueDraft());

  protected readonly createForm = form(this.draft, (path) => {
    required(path.immatriculation, {
      message: "L'immatriculation est obligatoire.",
    });
    pattern(path.immatriculation, IMMAT_PATTERN, {
      message: "Format attendu : AA-123-AA.",
    });
    required(path.carrosserie, { message: "La carrosserie est obligatoire." });
    min(path.volumeUtileM3, 0, {
      message: "Le volume ne peut pas être négatif.",
    });
    min(path.chargeUtileKg, 0, {
      message: "La charge utile ne peut pas être négative.",
    });
    min(path.nbPositionsPalettes, 0, {
      message: "Le nombre de positions ne peut pas être négatif.",
    });
  });

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.createForm, async () => {
      try {
        const created = await this.api.create(draftToWrite(this.draft()));
        this.toast.success("Remorque créée.");
        await this.router.navigate(["/remorques", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
