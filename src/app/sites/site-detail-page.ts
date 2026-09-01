import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import {
  FormField,
  form,
  max,
  min,
  required,
  submit,
} from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { firstFieldError } from "../core/forms/first-field-error";
import { draftToWrite, emptySiteDraft, type Site, siteToDraft } from "./site";
import { SiteApi } from "./site-api";

@Component({
  imports: [FormField, RouterLink],
  selector: "app-site-detail-page",
  templateUrl: "./site-detail-page.html",
})
export class SiteDetailPage {
  private readonly api = inject(SiteApi);

  readonly id = input.required<string>();

  protected readonly firstFieldError = firstFieldError;
  protected readonly formError = signal<string | null>(null);
  protected readonly deactivateError = signal<string | null>(null);

  protected readonly site = httpResource<Site>(() => ({
    url: `${environment.apiBaseUrl}/sites/${this.id()}`,
  }));

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.site.error())
  );

  protected readonly draft = signal(emptySiteDraft());

  protected readonly editForm = form(this.draft, (path) => {
    required(path.libelle, { message: "Le libellé est obligatoire." });
    min(path.latitude, -90, { message: "Latitude minimale : -90." });
    max(path.latitude, 90, { message: "Latitude maximale : 90." });
    min(path.longitude, -180, { message: "Longitude minimale : -180." });
    max(path.longitude, 180, { message: "Longitude maximale : 180." });
  });

  private seededForId = "";

  constructor() {
    effect(() => {
      const id = this.id();
      const current = this.site.value();
      if (!current || current.id !== id || this.seededForId === id) {
        return;
      }
      this.seededForId = id;
      this.draft.set(siteToDraft(current));
    });
  }

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
    await submit(this.editForm, async () => {
      try {
        const updated = await this.api.update(
          this.id(),
          draftToWrite(this.draft())
        );
        this.draft.set(siteToDraft(updated));
        this.site.reload();
      } catch (error) {
        // Second save 500s until SiteRepositoryAdapter updates in place
        // (same pattern as VehiculeRepositoryAdapter).
        this.formError.set(httpErrorMessage(error));
      }
    });
  }

  protected async desactiver(): Promise<void> {
    this.deactivateError.set(null);
    try {
      await this.api.desactiver(this.id());
      this.seededForId = "";
      this.site.reload();
    } catch (error) {
      // DELETE also save()s the aggregate — same optimistic-lock 500 after
      // an earlier PUT. Backend: in-place update in SiteRepositoryAdapter.
      this.deactivateError.set(httpErrorMessage(error));
    }
  }
}
