import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { validateTimeWindowEndAfterStart } from "../core/forms/time-window-validation";
import type { Commande } from "../commandes/commande";
import {
  CARROSSERIES_REQUISES,
  carrosserieRequiseLabel,
  draftToWrite,
  emptyDossierDraft,
  type DossierLookupSite,
  TYPE_TRANSPORTS,
  typeTransportLabel,
} from "./dossier";
import { DossierApi } from "./dossier-api";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [FormField, RouterLink],
  selector: "app-dossier-create-page",
  templateUrl: "./dossier-create-page.html",
})
export class DossierCreatePage {
  private readonly api = inject(DossierApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly types = TYPE_TRANSPORTS;
  protected readonly carrosseries = CARROSSERIES_REQUISES;
  protected readonly typeTransportLabel = typeTransportLabel;
  protected readonly carrosserieRequiseLabel = carrosserieRequiseLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly formError = signal<string | null>(null);

  protected readonly draft = signal(
    emptyDossierDraft(this.route.snapshot.queryParamMap.get("commandeId") ?? "")
  );

  protected readonly createForm = form(this.draft, (path) => {
    required(path.commandeId, {
      message: "La commande confirmée est obligatoire.",
    });
    required(path.familleMarchandise, {
      message: "La famille de marchandise est obligatoire.",
    });
    required(path.designation, {
      message: "La désignation est obligatoire.",
    });
    required(path.chargementSiteId, {
      message: "Le site de chargement est obligatoire.",
    });
    required(path.dechargementSiteId, {
      message: "Le site de déchargement est obligatoire.",
    });
    min(path.nbPalettes, 0, {
      message: "Le nombre de palettes ne peut pas être négatif.",
    });
    min(path.poidsKg, 0, { message: "Le poids ne peut pas être négatif." });
    min(path.volumeM3, 0, { message: "Le volume ne peut pas être négatif." });
    min(path.nbColis, 0, {
      message: "Le nombre de colis ne peut pas être négatif.",
    });
    required(path.chargementDebut, {
      message: "Le début de fenêtre de chargement est obligatoire.",
    });
    required(path.chargementFin, {
      message: "La fin de fenêtre de chargement est obligatoire.",
    });
    required(path.dechargementDebut, {
      message: "Le début de fenêtre de déchargement est obligatoire.",
    });
    required(path.dechargementFin, {
      message: "La fin de fenêtre de déchargement est obligatoire.",
    });
    validateTimeWindowEndAfterStart(
      path.chargementFin,
      path.chargementDebut,
      "La fin de chargement doit être postérieure au début."
    );
    validateTimeWindowEndAfterStart(
      path.dechargementFin,
      path.dechargementDebut,
      "La fin de déchargement doit être postérieure au début."
    );
  });

  protected readonly commandes = httpResource<PageResponse<Commande>>(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/commandes`,
  }));

  protected readonly sites = httpResource<PageResponse<DossierLookupSite>>(() => ({
    params: { page: 0, q: "", size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/sites`,
  }));

  protected readonly commandeOptions = computed(() =>
    (this.commandes.value()?.content ?? []).filter(
      (commande) => commande.statut === "CONFIRMEE"
    )
  );

  protected readonly siteOptions = computed(() =>
    (this.sites.value()?.content ?? []).filter((site) => site.actif)
  );

  protected readonly lookupsReady = computed(
    () => this.commandes.hasValue() && this.sites.hasValue()
  );

  protected readonly lookupsError = computed(() => {
    const commandeError = this.commandes.error();
    if (commandeError) {
      return httpErrorMessage(commandeError);
    }
    const siteError = this.sites.error();
    return siteError ? httpErrorMessage(siteError) : null;
  });

  protected onGroupable(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.draft.update((current) => ({
        ...current,
        groupable: target.checked,
      }));
    }
  }

  protected onGerbable(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.draft.update((current) => ({
        ...current,
        gerbable: target.checked,
      }));
    }
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.createForm, async () => {
      try {
        const created = await this.api.create(draftToWrite(this.draft()));
        await this.router.navigate(["/dossiers", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
