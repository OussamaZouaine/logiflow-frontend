import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCalendarClock,
  lucideCheck,
  lucideCircleAlert,
  lucideContainer,
  lucideFolderOpen,
  lucideInfo,
  lucideLoaderCircle,
  lucideRoute,
  lucideSave,
  lucideSparkles,
  lucideTruck,
  lucideUsers,
} from "@ng-icons/lucide";
import { ZardAlertComponent } from "@/shared/components/alert";
import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import {
  ZardCardComponent,
  ZardCardContentComponent,
  ZardCardDescriptionComponent,
  ZardCardHeaderComponent,
  ZardCardTitleComponent,
} from "@/shared/components/card/card.component";
import { ZardInputComponent } from "@/shared/components/input";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import {
  enumToSelectOptions,
  type FieldSelectOption,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { validateTimeWindowEndAfterStart } from "../core/forms/time-window-validation";
import {
  formatChauffeurLabel,
  type ChauffeurListItem,
} from "../chauffeurs/chauffeur";
import type { Dossier } from "../dossiers/dossier";
import {
  buildItinerairePoints,
  canCalculerItineraire,
  roundDistanceKm,
  roundDureeConduiteMin,
} from "../ia/itineraire";
import { ItineraireApi } from "../ia/itineraire-api";
import {
  canSuggererGroupage,
  dossierReferencesForIds,
  formatPropositionGainKm,
  formatPropositionScore,
  groupageCandidateIds,
  type PropositionGroupage,
  propositionSourceLabel,
} from "../ia/groupage";
import { GroupageApi } from "../ia/groupage-api";
import {
  formatRemorqueLabel,
  type RemorqueListItem,
} from "../remorques/remorque";
import type { Site } from "../sites/site";
import {
  draftToWrite,
  emptyVoyageDraft,
  formatDossierVoyageLabel,
  formatVehiculeLookupLabel,
  PORTEES,
  porteeLabel,
  TYPE_VOYAGES,
  typeVoyageLabel,
  validateDossierIds,
  type VoyageLookupVehicule,
} from "./voyage";
import { VoyageApi } from "./voyage-api";
import { RemorqueCapacityPreview } from "./remorque-capacity-preview";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [
    FormField,
    RemorqueCapacityPreview,
    RouterLink,
    NgIcon,
    ZardAlertComponent,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    ZardCardContentComponent,
    ZardCardDescriptionComponent,
    ZardCardHeaderComponent,
    ZardCardTitleComponent,
    ZardInputComponent,
    ...FORM_PAGE_IMPORTS,
  ],
  selector: "app-voyage-create-page",
  templateUrl: "./voyage-create-page.html",
  styleUrl: "./voyage-create-page.css",
  viewProviders: [
    provideIcons({
      lucideCalendarClock,
      lucideCheck,
      lucideCircleAlert,
      lucideContainer,
      lucideFolderOpen,
      lucideInfo,
      lucideLoaderCircle,
      lucideRoute,
      lucideSave,
      lucideSparkles,
      lucideTruck,
      lucideUsers,
    }),
  ],
})
export class VoyageCreatePage {
  private readonly api = inject(VoyageApi);
  private readonly itineraireApi = inject(ItineraireApi);
  private readonly groupageApi = inject(GroupageApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly formatChauffeurLabel = formatChauffeurLabel;
  protected readonly typeVoyageOptions = enumToSelectOptions(
    TYPE_VOYAGES,
    typeVoyageLabel
  );
  protected readonly porteeOptions = enumToSelectOptions(PORTEES, porteeLabel);
  protected readonly formatDossierVoyageLabel = formatDossierVoyageLabel;
  protected readonly formatRemorqueLabel = formatRemorqueLabel;
  protected readonly formatVehiculeLookupLabel = formatVehiculeLookupLabel;
  protected readonly types = TYPE_VOYAGES;
  protected readonly portees = PORTEES;
  protected readonly typeVoyageLabel = typeVoyageLabel;
  protected readonly porteeLabel = porteeLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly formError = signal<string | null>(null);
  protected readonly dossierSelectionError = signal<string | null>(null);
  protected readonly itineraireError = signal<string | null>(null);
  protected readonly itineraireCalculating = signal(false);
  protected readonly groupageError = signal<string | null>(null);
  protected readonly groupageLoading = signal(false);
  protected readonly groupagePropositions = signal<
    readonly PropositionGroupage[]
  >([]);

  protected readonly formatPropositionScore = formatPropositionScore;
  protected readonly formatPropositionGainKm = formatPropositionGainKm;
  protected readonly propositionSourceLabel = propositionSourceLabel;
  protected readonly dossierReferencesForIds = dossierReferencesForIds;

  protected readonly selectedDossierIds = signal<string[]>(
    this.initialDossierSelection()
  );

  protected readonly vehicules = httpResource<
    PageResponse<VoyageLookupVehicule>
  >(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/vehicules`,
  }));

  protected readonly dossiers = httpResource<PageResponse<Dossier>>(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/dossiers`,
  }));

  protected readonly sites = httpResource<PageResponse<Site>>(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/sites`,
  }));

  protected readonly chauffeurs = httpResource<
    PageResponse<ChauffeurListItem>
  >(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/chauffeurs`,
  }));

  protected readonly remorques = httpResource<PageResponse<RemorqueListItem>>(
    () => ({
      params: { page: 0, size: LOOKUP_PAGE_SIZE },
      url: `${environment.apiBaseUrl}/remorques`,
    })
  );

  protected readonly lookupsError = computed(() => {
    const vehiculeError = this.vehicules.error();
    if (vehiculeError) {
      return httpErrorMessage(vehiculeError);
    }
    const dossierError = this.dossiers.error();
    if (dossierError) {
      return httpErrorMessage(dossierError);
    }
    const chauffeurError = this.chauffeurs.error();
    if (chauffeurError) {
      return httpErrorMessage(chauffeurError);
    }
    const siteError = this.sites.error();
    if (siteError) {
      return httpErrorMessage(siteError);
    }
    return null;
  });

  protected readonly remorqueLookupError = computed(() => {
    const remorqueError = this.remorques.error();
    return remorqueError ? httpErrorMessage(remorqueError) : null;
  });

  protected readonly lookupsReady = computed(
    () =>
      this.vehicules.hasValue() &&
      this.dossiers.hasValue() &&
      this.chauffeurs.hasValue() &&
      this.sites.hasValue()
  );

  protected readonly vehiculeOptions = computed(
    () => this.vehicules.value()?.content ?? []
  );

  protected readonly dossierOptions = computed(() =>
    (this.dossiers.value()?.content ?? []).filter(
      (dossier) => dossier.statut === "CREE"
    )
  );

  protected readonly chauffeurOptions = computed(
    () => this.chauffeurs.value()?.content ?? []
  );

  protected readonly remorqueOptions = computed(() => {
    if (!this.remorques.hasValue()) {
      return [];
    }
    return this.remorques.value()?.content ?? [];
  });

  protected readonly vehiculeSelectOptions = computed<
    readonly FieldSelectOption[]
  >(() =>
    this.vehiculeOptions().map((vehicule) => ({
      label: formatVehiculeLookupLabel(vehicule),
      value: vehicule.id,
    }))
  );

  protected readonly remorqueSelectOptions = computed<
    readonly FieldSelectOption[]
  >(() =>
    withNoneSelectOption(
      "Sans remorque",
      this.remorqueOptions().map((remorque) => ({
        label: formatRemorqueLabel(remorque),
        value: remorque.id,
      }))
    )
  );

  protected readonly chauffeurSelectOptions = computed<
    readonly FieldSelectOption[]
  >(() =>
    this.chauffeurOptions().map((chauffeur) => ({
      label: formatChauffeurLabel(chauffeur),
      value: chauffeur.id,
    }))
  );

  protected readonly remorquesLoading = computed(
    () => this.remorques.isLoading() && !this.remorques.hasValue()
  );

  protected readonly dossiersById = computed(() => {
    const map = new Map<string, Dossier>();
    for (const dossier of this.dossiers.value()?.content ?? []) {
      map.set(dossier.id, dossier);
    }
    return map;
  });

  protected readonly sitesById = computed(() => {
    const sites = this.sites.value()?.content ?? [];
    return new Map(sites.map((site) => [site.id, site] as const));
  });

  protected readonly itinerairePoints = computed(() =>
    buildItinerairePoints(
      this.selectedDossierIds(),
      this.dossiersById(),
      this.sitesById()
    )
  );

  protected readonly canCalculerItineraire = computed(() =>
    canCalculerItineraire(this.itinerairePoints())
  );

  protected readonly canSuggererGroupage = computed(() =>
    canSuggererGroupage(this.dossiers.value()?.content ?? [])
  );

  protected readonly groupageHint = computed(() => {
    if (!this.canSuggererGroupage()) {
      return "Au moins deux dossiers Créé et groupables sont requis.";
    }
    return null;
  });

  protected readonly itineraireHint = computed(() => {
    if (this.selectedDossierIds().length === 0) {
      return "Sélectionnez des dossiers pour calculer distance et durée.";
    }
    if (!this.canCalculerItineraire()) {
      return "Au moins deux sites géolocalisés sont requis (segments des dossiers).";
    }
    return null;
  });

  protected readonly draft = signal(emptyVoyageDraft());

  protected readonly createForm = form(this.draft, (path) => {
    required(path.typeVoyage, { message: "Le type est obligatoire." });
    required(path.portee, { message: "La portée est obligatoire." });
    required(path.departPrevu, { message: "Le départ prévu est obligatoire." });
    required(path.arriveePrevue, {
      message: "L'arrivée prévue est obligatoire.",
    });
    required(path.vehiculeId, { message: "Le véhicule est obligatoire." });
    required(path.chauffeurId, { message: "Le chauffeur est obligatoire." });
    min(path.distanceTotaleKm, 0, {
      message: "La distance ne peut pas être négative.",
    });
    min(path.dureeConduiteMin, 0, {
      message: "La durée de conduite ne peut pas être négative.",
    });
    validateTimeWindowEndAfterStart(
      path.arriveePrevue,
      path.departPrevu,
      "L'arrivée prévue doit être postérieure au départ prévu."
    );
  });

  protected isDossierSelected(id: string): boolean {
    return this.selectedDossierIds().includes(id);
  }

  protected toggleDossier(id: string, checked: boolean): void {
    this.dossierSelectionError.set(null);
    this.itineraireError.set(null);
    this.groupageError.set(null);
    this.groupagePropositions.set([]);
    this.selectedDossierIds.update((current) => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }
      return current.filter((value) => value !== id);
    });
  }

  protected async calculerItineraire(): Promise<void> {
    this.itineraireError.set(null);

    if (!this.canCalculerItineraire()) {
      this.itineraireError.set(
        this.itineraireHint() ??
          "Impossible de calculer l'itinéraire avec la sélection actuelle."
      );
      return;
    }

    this.itineraireCalculating.set(true);
    try {
      const result = await this.itineraireApi.calculer(this.itinerairePoints());
      this.draft.update((current) => ({
        ...current,
        distanceTotaleKm: roundDistanceKm(result.distanceKm),
        dureeConduiteMin: roundDureeConduiteMin(result.dureeMin),
      }));
      this.toast.success("Distance et durée mises à jour.");
    } catch (error) {
      this.itineraireError.set(httpErrorMessage(error));
    } finally {
      this.itineraireCalculating.set(false);
    }
  }

  protected async suggererGroupage(): Promise<void> {
    this.groupageError.set(null);
    this.groupagePropositions.set([]);

    const dossierIds = groupageCandidateIds(
      this.dossiers.value()?.content ?? []
    );
    if (dossierIds.length < 2) {
      this.groupageError.set(
        this.groupageHint() ??
          "Impossible de suggérer un groupage avec la sélection actuelle."
      );
      return;
    }

    this.groupageLoading.set(true);
    try {
      const propositions = await this.groupageApi.propositions({ dossierIds });
      this.groupagePropositions.set(propositions);
      if (propositions.length === 0) {
        this.groupageError.set(
          "Aucune proposition : vérifiez que les dossiers sont groupables."
        );
      }
    } catch (error) {
      this.groupageError.set(httpErrorMessage(error));
    } finally {
      this.groupageLoading.set(false);
    }
  }

  protected appliquerProposition(proposition: PropositionGroupage): void {
    this.dossierSelectionError.set(null);
    this.itineraireError.set(null);
    this.selectedDossierIds.set([...proposition.dossierIds]);
    this.draft.update((current) => ({
      ...current,
      typeVoyage: "GROUPAGE",
    }));
    this.toast.success("Proposition de groupage appliquée.");
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    this.dossierSelectionError.set(
      validateDossierIds(this.selectedDossierIds())
    );

    await submit(this.createForm, async () => {
      if (this.dossierSelectionError()) {
        return;
      }
      try {
        const created = await this.api.create(
          draftToWrite(
            this.draft(),
            this.selectedDossierIds(),
            this.dossiersById()
          )
        );
        this.toast.success("Voyage créé.");
        await this.router.navigate(["/voyages", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }

  private initialDossierSelection(): string[] {
    const dossierId = this.route.snapshot.queryParamMap.get("dossierId");
    return dossierId && dossierId.length > 0 ? [dossierId] : [];
  }
}
