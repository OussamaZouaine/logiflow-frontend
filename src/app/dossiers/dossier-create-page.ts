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
import { validateTimeWindowEndAfterStart } from "../core/forms/time-window-validation";
import type { Commande } from "../commandes/commande";
import {
  formatMarchandiseLabel,
  type Marchandise,
} from "../marchandises/marchandise";
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
  imports: [FormField, RouterLink, ...FORM_PAGE_IMPORTS],
  selector: "app-dossier-create-page",
  templateUrl: "./dossier-create-page.html",
})
export class DossierCreatePage {
  private readonly api = inject(DossierApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly types = TYPE_TRANSPORTS;
  protected readonly carrosseries = CARROSSERIES_REQUISES;
  protected readonly typeTransportLabel = typeTransportLabel;
  protected readonly carrosserieRequiseLabel = carrosserieRequiseLabel;
  protected readonly formatMarchandiseLabel = formatMarchandiseLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly formError = signal<string | null>(null);

  private lastPrefilledCommandeId = "";

  protected readonly draft = signal(
    emptyDossierDraft(this.route.snapshot.queryParamMap.get("commandeId") ?? "")
  );

  constructor() {
    effect(() => {
      const commandeId = this.draft().commandeId;
      if (
        !commandeId ||
        !this.commandes.hasValue() ||
        !this.marchandises.hasValue()
      ) {
        if (!commandeId) {
          this.lastPrefilledCommandeId = "";
        }
        return;
      }
      if (commandeId === this.lastPrefilledCommandeId) {
        return;
      }
      this.lastPrefilledCommandeId = commandeId;
      this.applyCommandeLinePrefill(commandeId);
    });
  }

  protected readonly createForm = form(this.draft, (path) => {
    required(path.commandeId, {
      message: "La commande confirmée est obligatoire.",
    });
    required(path.familleMarchandise, {
      message: "La famille de marchandise est obligatoire.",
    });
    required(path.marchandiseId, {
      message: "La marchandise est obligatoire.",
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

  protected readonly marchandises = httpResource<PageResponse<Marchandise>>(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/marchandises`,
  }));

  protected readonly commandeOptions = computed(() =>
    (this.commandes.value()?.content ?? []).filter(
      (commande) => commande.statut === "CONFIRMEE"
    )
  );

  protected readonly siteOptions = computed(() =>
    (this.sites.value()?.content ?? []).filter((site) => site.actif)
  );

  protected readonly marchandiseOptions = computed(() =>
    (this.marchandises.value()?.content ?? []).filter(
      (marchandise) => marchandise.actif
    )
  );

  protected readonly marchandisesById = computed(() => {
    const map = new Map<string, Marchandise>();
    for (const marchandise of this.marchandises.value()?.content ?? []) {
      map.set(marchandise.id, marchandise);
    }
    return map;
  });

  protected readonly lookupsReady = computed(
    () =>
      this.commandes.hasValue() &&
      this.sites.hasValue() &&
      this.marchandises.hasValue()
  );

  protected readonly lookupsError = computed(() => {
    const commandeError = this.commandes.error();
    if (commandeError) {
      return httpErrorMessage(commandeError);
    }
    const siteError = this.sites.error();
    if (siteError) {
      return httpErrorMessage(siteError);
    }
    const marchandiseError = this.marchandises.error();
    return marchandiseError ? httpErrorMessage(marchandiseError) : null;
  });

  private applyCommandeLinePrefill(commandeId: string): void {
    const commande = this.commandeOptions().find((item) => item.id === commandeId);
    const ligne = commande?.lignes[0];
    if (!ligne) {
      return;
    }
    const marchandise = this.marchandisesById().get(ligne.marchandiseId);
    this.draft.update((current) => ({
      ...current,
      marchandiseId: ligne.marchandiseId,
      poidsKg: ligne.poidsKg,
      volumeM3: ligne.volumeM3,
      nbColis: ligne.nbColis,
      familleMarchandise:
        marchandise?.famille?.trim() || current.familleMarchandise,
      classeAdr: marchandise?.classeAdr ?? "",
      numeroOnu: marchandise?.numeroOnu ?? "",
      gerbable: marchandise?.gerbable ?? current.gerbable,
    }));
  }

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
        this.toast.success("Dossier créé.");
        await this.router.navigate(["/dossiers", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
