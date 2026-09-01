import { Component, inject, signal } from "@angular/core";
import {
  FormField,
  form,
  max,
  min,
  required,
  submit,
} from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { httpErrorMessage } from "../core/api/http-error";
import { firstFieldError } from "../core/forms/first-field-error";
import { draftToWrite, emptySiteDraft } from "./site";
import { SiteApi } from "./site-api";

@Component({
  imports: [FormField, RouterLink],
  selector: "app-site-create-page",
  templateUrl: "./site-create-page.html",
})
export class SiteCreatePage {
  private readonly api = inject(SiteApi);
  private readonly router = inject(Router);

  protected readonly firstFieldError = firstFieldError;
  protected readonly formError = signal<string | null>(null);

  protected readonly draft = signal(emptySiteDraft());

  protected readonly createForm = form(this.draft, (path) => {
    required(path.code, { message: "Le code est obligatoire." });
    required(path.libelle, { message: "Le libellé est obligatoire." });
    min(path.latitude, -90, { message: "Latitude minimale : -90." });
    max(path.latitude, 90, { message: "Latitude maximale : 90." });
    min(path.longitude, -180, { message: "Longitude minimale : -180." });
    max(path.longitude, 180, { message: "Longitude maximale : 180." });
  });

  protected onPoidsLourd(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.draft.update((current) => ({
        ...current,
        interditPoidsLourd: target.checked,
      }));
    }
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.createForm, async () => {
      try {
        const created = await this.api.create(draftToWrite(this.draft()));
        await this.router.navigate(["/sites", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
