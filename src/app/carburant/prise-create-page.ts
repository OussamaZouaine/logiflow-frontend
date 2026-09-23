import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import { FormField, form, required, submit } from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import {
  enumToSelectOptions,
  type FieldSelectOption,
} from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import type { Voyage } from "../voyages/voyage";
import { PriseCarburantApi } from "./prise-carburant-api";
import {
  draftToWrite,
  emptyPriseCarburantDraft,
  TYPE_CARBURANTS,
  typeCarburantLabel,
} from "./prise-carburant";
import type { Station } from "./station";

@Component({
  imports: [FormField, NgIcon, RouterLink, ...FORM_PAGE_IMPORTS],
  selector: "app-prise-create-page",
  templateUrl: "./prise-create-page.html",
  viewProviders: [provideIcons({ lucideCheck })],
})
export class PriseCreatePage {
  private readonly api = inject(PriseCarburantApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly typeOptions = enumToSelectOptions(
    TYPE_CARBURANTS,
    typeCarburantLabel
  );
  protected readonly formError = signal<string | null>(null);

  private readonly voyageIdFromQuery = signal(
    this.route.snapshot.queryParamMap.get("voyageId") ?? ""
  );

  protected readonly draft = signal(
    emptyPriseCarburantDraft(this.voyageIdFromQuery())
  );

  protected readonly voyages = httpResource<PageResponse<Voyage>>(() => ({
    params: { page: 0, size: 100 },
    url: `${environment.apiBaseUrl}/voyages`,
  }));

  protected readonly stations = httpResource<PageResponse<Station>>(() => ({
    params: { page: 0, size: 100 },
    url: `${environment.apiBaseUrl}/stations`,
  }));

  protected readonly selectedVoyage = computed(() => {
    const voyageId = this.draft().voyageId;
    const page = this.voyages.value();
    if (!voyageId || !page) {
      return null;
    }
    return page.content.find((voyage) => voyage.id === voyageId) ?? null;
  });

  protected readonly voyageSelectOptions = computed<readonly FieldSelectOption[]>(
    () =>
      (this.voyages.value()?.content ?? []).map((voyage) => ({
        label: voyage.reference,
        value: voyage.id,
      }))
  );

  protected readonly stationSelectOptions = computed<readonly FieldSelectOption[]>(
    () =>
      (this.stations.value()?.content ?? [])
        .filter((station) => station.actif)
        .map((station) => ({
          label: `${station.code} — ${station.libelle}`,
          value: station.id,
        }))
  );

  protected readonly enginOptions = computed<readonly FieldSelectOption[]>(() => {
    const voyage = this.selectedVoyage();
    if (!voyage) {
      return [];
    }
    const options: FieldSelectOption[] = [
      { label: "Véhicule du voyage", value: "vehicule" },
    ];
    if (voyage.remorqueId) {
      options.push({ label: "Remorque du voyage", value: "remorque" });
    }
    return options;
  });

  protected readonly voyageLocked = computed(
    () => this.voyageIdFromQuery().length > 0
  );

  protected readonly backLink = computed(() =>
    this.voyageLocked()
      ? `/voyages/${this.draft().voyageId}`
      : "/carburant"
  );

  protected readonly createForm = form(this.draft, (path) => {
    required(path.voyageId, { message: "Le voyage est obligatoire." });
    required(path.stationId, { message: "La station est obligatoire." });
    required(path.litrage, { message: "Le litrage est obligatoire." });
    required(path.montantTtc, { message: "Le montant est obligatoire." });
    required(path.datePrise, { message: "La date est obligatoire." });
  });

  protected onVoyageIdChange(_voyageId: string): void {
    if (this.draft().engin !== "vehicule") {
      this.draft.update((current) => ({ ...current, engin: "vehicule" }));
    }
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    const voyage = this.selectedVoyage();
    if (!voyage) {
      this.formError.set("Sélectionnez un voyage valide.");
      return;
    }
    if (this.draft().engin === "remorque" && !voyage.remorqueId) {
      this.formError.set("Ce voyage n'a pas de remorque.");
      return;
    }
    await submit(this.createForm, async () => {
      try {
        const created = await this.api.create(draftToWrite(this.draft(), voyage));
        this.toast.success("Prise enregistrée en brouillon.");
        await this.router.navigate(["/carburant", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
