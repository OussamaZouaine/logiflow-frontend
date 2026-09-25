import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCalendarClock,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideContainer,
  lucideFolderOpen,
  lucideInfo,
  lucideLoaderCircle,
  lucideRoute,
  lucideSave,
  lucideSparkles,
  lucideTriangleAlert,
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
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { validateTimeWindowEndAfterStart } from "../core/forms/time-window-validation";
import type { Dossier } from "../dossiers/dossier";
import {
  buildItinerairePoints,
  canCalculerItineraire,
  roundDistanceKm,
  roundDureeConduiteMin,
} from "../ia/itineraire";
import { ItineraireApi } from "../ia/itineraire-api";
import {
  NB_OPTIONS_MAX,
  type OptionVoyage,
  type PropositionsVoyage,
} from "../ia/planification";
import { PlanificationApi } from "../ia/planification-api";
import type { RemorqueListItem } from "../remorques/remorque";
import {
  enumToSelectOptions,
  type FieldSelectOption,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import {
  datetimeLocalToDate,
  toDatetimeLocal,
} from "../shared/ui/iso-datetime";
import { ToastService } from "../shared/ui/toast";
import type { Site } from "../sites/site";
import { RemorqueCapacityPreview } from "./remorque-capacity-preview";
import {
  datetimeLocalToIso,
  emptyVoyageDraft,
  formatDossierVoyageLabel,
  PORTEES,
  type Portee,
  porteeLabel,
  TYPE_VOYAGES,
  type TypeVoyage,
  typeVoyageLabel,
  validateDossierIds,
} from "./voyage";
import { VoyageApi } from "./voyage-api";
import {
  type ConformiteVoyage,
  draftDepuisProposition,
  formatChauffeurDisponible,
  formatRemorqueDisponible,
  formatVehiculeDisponible,
  projetConformite,
  type RessourcesDisponibles,
  voyageAEnvoyer,
} from "./voyage-planification";
import { VoyagePropositions } from "./voyage-propositions";

const LOOKUP_PAGE_SIZE = 100;

type ModePlanification = "assiste" | "manuel";

interface PlanDraft {
  debut: string;
  fin: string;
  nbOptions: number;
  portee: Portee;
  typeVoyage: TypeVoyage;
}

function planDraftInitial(): PlanDraft {
  const debut = new Date();
  debut.setDate(debut.getDate() + 1);
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 7);
  return {
    debut: toDatetimeLocal(debut),
    fin: toDatetimeLocal(fin),
    nbOptions: 3,
    portee: "NATIONAL",
    typeVoyage: "GROUPAGE",
  };
}

@Component({
  imports: [
    FormField,
    RemorqueCapacityPreview,
    RouterLink,
    NgIcon,
    VoyagePropositions,
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
  styleUrl: "./voyage-create-page.css",
  templateUrl: "./voyage-create-page.html",
  viewProviders: [
    provideIcons({
      lucideCalendarClock,
      lucideCircleAlert,
      lucideCircleCheck,
      lucideContainer,
      lucideFolderOpen,
      lucideInfo,
      lucideLoaderCircle,
      lucideRoute,
      lucideSave,
      lucideSparkles,
      lucideTriangleAlert,
      lucideTruck,
      lucideUsers,
    }),
  ],
})
export class VoyageCreatePage {
  private readonly api = inject(VoyageApi);
  private readonly itineraireApi = inject(ItineraireApi);
  private readonly planificationApi = inject(PlanificationApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly typeVoyageOptions = enumToSelectOptions(
    TYPE_VOYAGES,
    typeVoyageLabel
  );
  protected readonly porteeOptions = enumToSelectOptions(PORTEES, porteeLabel);
  protected readonly nbOptionsChoix: readonly FieldSelectOption[] = Array.from(
    { length: NB_OPTIONS_MAX },
    (_, index) => ({ label: `${index + 1}`, value: `${index + 1}` })
  );
  protected readonly formatDossierVoyageLabel = formatDossierVoyageLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;

  // ─── Mode ────────────────────────────────────────────────────────────────

  protected readonly mode = signal<ModePlanification>(
    this.route.snapshot.queryParamMap.get("dossierId") ? "manuel" : "assiste"
  );

  // ─── Planification assistée ──────────────────────────────────────────────

  protected readonly planDraft = signal(planDraftInitial());
  protected readonly planForm = form(this.planDraft, (path) => {
    required(path.debut, { message: "Le début de période est obligatoire." });
    required(path.fin, { message: "La fin de période est obligatoire." });
    validateTimeWindowEndAfterStart(
      path.fin,
      path.debut,
      "La fin de période doit suivre son début."
    );
  });
  protected readonly propositions = signal<PropositionsVoyage | null>(null);
  protected readonly planLoading = signal(false);
  protected readonly planError = signal<string | null>(null);
  protected readonly propositionAppliquee = signal<OptionVoyage | null>(null);

  // ─── Planification manuelle ──────────────────────────────────────────────

  protected readonly formError = signal<string | null>(null);
  protected readonly dossierSelectionError = signal<string | null>(null);
  protected readonly itineraireError = signal<string | null>(null);
  protected readonly itineraireCalculating = signal(false);
  protected readonly selectedDossierIds = signal<string[]>(
    this.initialDossierSelection()
  );
  protected readonly draft = signal(emptyVoyageDraft());

  protected readonly dossiers = httpResource<PageResponse<Dossier>>(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE, statut: "CREE" },
    url: `${environment.apiBaseUrl}/dossiers`,
  }));

  protected readonly sites = httpResource<PageResponse<Site>>(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/sites`,
  }));

  /** Période du voyage en ISO, null tant que les dates ne sont pas cohérentes. */
  private readonly periode = computed(() => {
    const debut = datetimeLocalToDate(this.draft().departPrevu);
    const fin = datetimeLocalToDate(this.draft().arriveePrevue);
    if (!(debut && fin) || fin <= debut) {
      return null;
    }
    return { debut: debut.toISOString(), fin: fin.toISOString() };
  });

  /** Véhicules, remorques et chauffeurs libres et exploitables sur la période du voyage. */
  protected readonly ressources = httpResource<RessourcesDisponibles>(() => {
    const periode = this.periode();
    return periode
      ? {
          params: periode,
          url: `${environment.apiBaseUrl}/voyages/ressources-disponibles`,
        }
      : undefined;
  });

  /** Contrôle de conformité à blanc, relancé à chaque modification du projet. */
  protected readonly conformite = httpResource<ConformiteVoyage>(() => {
    const projet = projetConformite(
      this.draft(),
      this.selectedDossierIds(),
      this.propositionAppliquee()
    );
    return projet
      ? {
          body: projet,
          method: "POST",
          url: `${environment.apiBaseUrl}/voyages/conformite`,
        }
      : undefined;
  });

  protected readonly lookupsError = computed(() => {
    const erreur = this.dossiers.error() ?? this.sites.error();
    return erreur ? httpErrorMessage(erreur) : null;
  });

  protected readonly lookupsReady = computed(
    () => this.dossiers.hasValue() && this.sites.hasValue()
  );

  protected readonly dossierOptions = computed(
    () => this.dossiers.value()?.content ?? []
  );

  protected readonly vehiculeSelectOptions = computed<
    readonly FieldSelectOption[]
  >(() =>
    (this.ressources.value()?.vehicules ?? []).map((vehicule) => ({
      label: formatVehiculeDisponible(vehicule),
      value: vehicule.id,
    }))
  );

  protected readonly remorqueOptions = computed<readonly RemorqueListItem[]>(
    () =>
      (this.ressources.value()?.remorques ?? []).map(
        (remorque) => remorque as unknown as RemorqueListItem
      )
  );

  protected readonly remorqueSelectOptions = computed<
    readonly FieldSelectOption[]
  >(() =>
    withNoneSelectOption(
      "Sans remorque",
      (this.ressources.value()?.remorques ?? []).map((remorque) => ({
        label: formatRemorqueDisponible(remorque),
        value: remorque.id,
      }))
    )
  );

  protected readonly chauffeurSelectOptions = computed<
    readonly FieldSelectOption[]
  >(() =>
    (this.ressources.value()?.chauffeurs ?? []).map((chauffeur) => ({
      label: formatChauffeurDisponible(chauffeur),
      value: chauffeur.id,
    }))
  );

  /** Renfort : tous les chauffeurs sauf le titulaire, avec l'option « aucun ». */
  protected readonly chauffeurRenfortOptions = computed(() =>
    withNoneSelectOption(
      "Aucun renfort",
      this.chauffeurSelectOptions().filter(
        (option) => option.value !== this.draft().chauffeurId
      )
    )
  );

  protected readonly dossiersById = computed(() => {
    const map = new Map<string, Dossier>();
    for (const dossier of this.dossierOptions()) {
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

  protected readonly itineraireHint = computed(() => {
    if (this.selectedDossierIds().length === 0) {
      return "Sélectionnez des dossiers pour calculer distance et durée.";
    }
    if (!this.canCalculerItineraire()) {
      return "Au moins deux sites géolocalisés sont requis (segments des dossiers).";
    }
    return null;
  });

  protected readonly anomaliesBloquantes = computed(() =>
    (this.conformite.value()?.anomalies ?? []).filter((a) => a.bloquante)
  );

  protected readonly avertissements = computed(() =>
    (this.conformite.value()?.anomalies ?? []).filter((a) => !a.bloquante)
  );

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

  protected choisirMode(mode: ModePlanification): void {
    this.mode.set(mode);
  }

  protected onNbOptions(valeur: string): void {
    const nb = Number.parseInt(valeur, 10);
    if (nb >= 1 && nb <= NB_OPTIONS_MAX) {
      this.planDraft.update((courant) => ({ ...courant, nbOptions: nb }));
    }
  }

  protected async proposer(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.planError.set(null);
    await submit(this.planForm, async () => {
      const plan = this.planDraft();
      this.planLoading.set(true);
      this.propositions.set(null);
      try {
        this.propositions.set(
          await this.planificationApi.proposer({
            debut: datetimeLocalToIso(plan.debut),
            fin: datetimeLocalToIso(plan.fin),
            nbOptions: plan.nbOptions,
            portee: plan.portee,
            typeVoyage: plan.typeVoyage,
          })
        );
      } catch (error) {
        this.planError.set(httpErrorMessage(error));
      } finally {
        this.planLoading.set(false);
      }
    });
  }

  /** Pré-remplit le formulaire manuel avec la proposition, pour relecture avant création. */
  protected choisir(option: OptionVoyage): void {
    this.formError.set(null);
    this.dossierSelectionError.set(null);
    this.itineraireError.set(null);
    this.propositionAppliquee.set(option);
    this.selectedDossierIds.set([...option.dossierIds]);
    this.draft.update((courant) => draftDepuisProposition(option, courant));
    this.mode.set("manuel");
    this.toast.success(
      `Proposition ${option.rang} appliquée : relisez puis créez le voyage.`
    );
  }

  protected isDossierSelected(id: string): boolean {
    return this.selectedDossierIds().includes(id);
  }

  protected toggleDossier(id: string, checked: boolean): void {
    this.dossierSelectionError.set(null);
    this.itineraireError.set(null);
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
          voyageAEnvoyer(
            this.draft(),
            this.selectedDossierIds(),
            this.dossiersById(),
            this.propositionAppliquee()
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
