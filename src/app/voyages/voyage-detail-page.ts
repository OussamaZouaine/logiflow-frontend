import { DecimalPipe } from "@angular/common";
import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideArrowRight,
  lucideCalendarCheck,
  lucideCalendarClock,
  lucideChevronRight,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideContainer,
  lucideFolderOpen,
  lucideFuel,
  lucideGauge,
  lucideHistory,
  lucideMapPin,
  lucidePackage,
  lucideRoute,
  lucideTruck,
  lucideUsers,
  lucideZap,
} from "@ng-icons/lucide";
import { ZardAlertComponent } from "@/shared/components/alert";
import { ZardBadgeComponent } from "@/shared/components/badge";
import type { ZardBadgeTypeVariants } from "@/shared/components/badge/badge.variants";
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
import {
  formatLitres,
  formatMontantTtc,
  formatPriseShortId,
  type PriseCarburant,
  statutPriseLabel,
  statutPriseTone,
} from "../carburant/prise-carburant";
import {
  type ChauffeurListItem,
  chauffeurLabelFromLookup,
} from "../chauffeurs/chauffeur";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import {
  type VehiculeLookup,
  vehiculeLabel,
} from "../maintenance/ordre-travail";
import type { RemorqueListItem } from "../remorques/remorque";
import { apercuToneToBadgeType } from "../shared/ui/apercu-zard";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { enumToSelectOptions } from "../shared/ui/field-select";
import { OpsTimeline } from "../shared/ui/ops-timeline";
import { StatutChip } from "../shared/ui/statut-chip";
import { ToastService } from "../shared/ui/toast";
import { voyageStatutTone } from "../tableau/apercu";
import { type ArretCarte, ItineraireCarte } from "./itineraire-carte";
import { RemorqueCapacityView } from "./remorque-capacity-view";
import {
  affectationRoleLabel,
  compareDatetimeLocal,
  datetimeLocalToIso,
  type Etape,
  type EvenementVoyage,
  formatDatetimeLocalForDisplay,
  formatDureeMin,
  formatInstant,
  type GeoPoint,
  isTypeEvenement,
  maxDatetimeLocal,
  minEvenementHorodatageLocal,
  nextStatuts,
  porteeLabel,
  remplissageLabel,
  type StatutVoyage,
  statutVoyageLabel,
  suggestedEvenementHorodatageLocal,
  TYPE_EVENEMENTS,
  type TypeEtape,
  type TypeEvenement,
  toDatetimeLocal,
  typeEtapeLabel,
  typeEvenementLabel,
  typeVoyageLabel,
  type Voyage,
} from "./voyage";
import { VoyageAjouterDossierForm } from "./voyage-ajouter-dossier-form";
import { VoyageApi } from "./voyage-api";
import {
  capaciteTronconTone,
  capaciteTronconToneClass,
} from "./voyage-capacite";
import type { ArretVoyage } from "./voyage-planification";
import {
  voyageActualTimelineEntries,
  voyagePlannedTimelineEntries,
} from "./voyage-timeline";

interface DossierLink {
  id: string;
  reference: string;
}

const ETAPE_DOT_CLASS: Record<TypeEtape, string> = {
  CARBURANT: "bg-amber",
  CHARGEMENT: "bg-pine",
  DECHARGEMENT: "bg-pine",
  DEPOT: "bg-muted",
  FRONTIERE: "bg-ink",
  PAUSE: "bg-muted",
  REPOS: "bg-muted",
};

@Component({
  imports: [
    DecimalPipe,
    NgIcon,
    RouterLink,
    ZardAlertComponent,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardInputComponent,
    OpsTimeline,
    StatutChip,
    RemorqueCapacityView,
    ItineraireCarte,
    VoyageAjouterDossierForm,
    ZardCardComponent,
    ZardCardContentComponent,
    ZardCardDescriptionComponent,
    ZardCardHeaderComponent,
    ZardCardTitleComponent,
    ...FICHE_PAGE_IMPORTS,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideCalendarCheck,
      lucideCalendarClock,
      lucideChevronRight,
      lucideCircleAlert,
      lucideCircleCheck,
      lucideContainer,
      lucideFolderOpen,
      lucideFuel,
      lucideGauge,
      lucideHistory,
      lucideMapPin,
      lucidePackage,
      lucideRoute,
      lucideTruck,
      lucideUsers,
      lucideZap,
    }),
  ],
  selector: "app-voyage-detail-page",
  styleUrl: "./voyage-detail-page.css",
  templateUrl: "./voyage-detail-page.html",
})
export class VoyageDetailPage {
  private readonly api = inject(VoyageApi);
  private readonly toast = inject(ToastService);
  private readonly capacityView = viewChild(RemorqueCapacityView);

  readonly id = input.required<string>();

  constructor() {
    effect(() => {
      const suggested = suggestedEvenementHorodatageLocal(
        this.evenements.value() ?? []
      );
      const minimum = this.minEventHorodatage();
      const current = this.eventHorodatage();
      if (current.length === 0) {
        this.eventHorodatage.set(suggested);
        return;
      }
      if (minimum && compareDatetimeLocal(current, minimum) < 0) {
        this.eventHorodatage.set(suggested);
      }
    });
  }

  protected readonly affectationRoleLabel = affectationRoleLabel;
  protected readonly capaciteTronconTone = capaciteTronconTone;
  protected readonly capaciteTronconToneClass = capaciteTronconToneClass;
  protected readonly formatDureeMin = formatDureeMin;
  protected readonly formatInstant = formatInstant;
  protected readonly nextStatuts = nextStatuts;
  protected readonly porteeLabel = porteeLabel;
  protected readonly remplissageLabel = remplissageLabel;
  protected readonly statutVoyageLabel = statutVoyageLabel;
  protected readonly voyageStatutTone = voyageStatutTone;
  protected readonly typeEtapeLabel = typeEtapeLabel;
  protected readonly typeEvenementLabel = typeEvenementLabel;
  protected readonly typeVoyageLabel = typeVoyageLabel;
  protected readonly eventTypes = TYPE_EVENEMENTS;
  protected readonly eventTypeOptions = enumToSelectOptions(
    TYPE_EVENEMENTS,
    typeEvenementLabel
  );

  protected readonly statutError = signal<string | null>(null);
  protected readonly eventError = signal<string | null>(null);
  protected readonly eventType = signal<TypeEvenement>("DEPART");
  protected readonly eventHorodatage = signal("");
  protected readonly eventComment = signal("");
  protected readonly eventLatitude = signal("");
  protected readonly eventLongitude = signal("");

  protected readonly voyage = httpResource<Voyage>(() => ({
    url: `${environment.apiBaseUrl}/voyages/${this.id()}`,
  }));

  /** Arrêts persistés (construits à la création depuis les sites des dossiers). */
  protected readonly arrets = httpResource<ArretVoyage[]>(() => ({
    url: `${environment.apiBaseUrl}/voyages/${this.id()}/arrets`,
  }));

  protected readonly arretsCarte = computed<readonly ArretCarte[]>(() =>
    (this.arrets.value() ?? []).map((arret) => ({
      id: arret.id,
      latitude: arret.latitude,
      libelle: arret.libelle,
      longitude: arret.longitude,
    }))
  );

  /** Libellé de l'arrêt correspondant à une étape, quand trajet et arrêts sont alignés. */
  protected arretLibelle(ordre: number): string | null {
    const arrets = this.arrets.value() ?? [];
    const etapes = this.voyage.value()?.trajet.etapes.length ?? 0;
    return arrets.length === etapes ? (arrets[ordre]?.libelle ?? null) : null;
  }

  protected readonly vehicules = httpResource<PageResponse<VehiculeLookup>>(
    () => ({
      params: { page: 0, size: 50 },
      url: `${environment.apiBaseUrl}/vehicules`,
    })
  );

  protected readonly remorques = httpResource<PageResponse<RemorqueListItem>>(
    () => ({
      params: { page: 0, size: 50 },
      url: `${environment.apiBaseUrl}/remorques`,
    })
  );

  protected readonly chauffeurs = httpResource<PageResponse<ChauffeurListItem>>(
    () => ({
      params: { page: 0, size: 50 },
      url: `${environment.apiBaseUrl}/chauffeurs`,
    })
  );

  protected readonly chauffeursById = computed(() => {
    const map = new Map<
      string,
      Pick<ChauffeurListItem, "matricule" | "nom" | "prenom">
    >();
    for (const chauffeur of this.chauffeurs.value()?.content ?? []) {
      map.set(chauffeur.id, chauffeur);
    }
    return map;
  });

  protected readonly dossiers = httpResource<PageResponse<DossierLink>>(() => ({
    params: { page: 0, size: 50 },
    url: `${environment.apiBaseUrl}/dossiers`,
  }));

  protected readonly dossiersById = computed(() => {
    const map = new Map<string, DossierLink>();
    for (const dossier of this.dossiers.value()?.content ?? []) {
      map.set(dossier.id, dossier);
    }
    return map;
  });

  protected readonly evenements = httpResource<EvenementVoyage[]>(() => ({
    url: `${environment.apiBaseUrl}/voyages/${this.id()}/evenements`,
  }));

  protected readonly prisesCarburant = httpResource<
    PageResponse<PriseCarburant>
  >(() => ({
    params: { page: 0, size: 20, voyageId: this.id() },
    url: `${environment.apiBaseUrl}/prises-carburant`,
  }));

  protected readonly formatLitres = formatLitres;
  protected readonly formatMontantTtc = formatMontantTtc;
  protected readonly formatPriseShortId = formatPriseShortId;
  protected readonly statutPriseLabel = statutPriseLabel;
  protected readonly statutPriseTone = statutPriseTone;

  protected readonly plannedTimelineEntries = computed(() => {
    const voyage = this.voyage.value();
    if (!voyage) {
      return [];
    }
    return voyagePlannedTimelineEntries(voyage);
  });

  protected readonly actualTimelineEntries = computed(() =>
    voyageActualTimelineEntries(this.evenements.value() ?? [])
  );

  protected readonly minEventHorodatage = computed(() =>
    minEvenementHorodatageLocal(this.evenements.value() ?? [])
  );

  protected readonly eventHorodatageHint = computed(() => {
    const minimum = this.minEventHorodatage();
    if (!minimum) {
      return null;
    }
    return `Au plus tôt : ${formatDatetimeLocalForDisplay(minimum)} (dernier événement enregistré).`;
  });

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.voyage.error())
  );

  protected readonly eventsError = computed(() => {
    const error = this.evenements.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected dossierLabel(dossierId: string): string {
    return this.dossiersById().get(dossierId)?.reference ?? dossierId;
  }

  protected titulaireChauffeurId(): string | null {
    const voyage = this.voyage.value();
    if (!voyage) {
      return null;
    }
    return (
      voyage.affectations.find(
        (affectation) => affectation.role === "TITULAIRE"
      )?.chauffeurId ??
      voyage.affectations[0]?.chauffeurId ??
      null
    );
  }

  protected chauffeurLabel(chauffeurId: string): string {
    return chauffeurLabelFromLookup(chauffeurId, this.chauffeursById());
  }

  protected affectedVehiculeLabel(): string {
    const voyage = this.voyage.value();
    if (!voyage) {
      return "";
    }
    return vehiculeLabel(
      voyage.vehiculeId,
      this.vehicules.value()?.content ?? []
    );
  }

  protected affectedRemorqueLabel(remorqueId: string): string {
    const remorque = this.remorques
      .value()
      ?.content.find((entry) => entry.id === remorqueId);
    return remorque?.immatriculation ?? remorqueId;
  }

  protected remplissagePercent(): number {
    const voyage = this.voyage.value();
    if (!voyage) {
      return 0;
    }
    return Math.min(Math.max(Math.round(voyage.tauxRemplissage * 100), 0), 100);
  }

  protected remplissageTone(): ReturnType<typeof capaciteTronconTone> {
    return capaciteTronconTone(this.remplissagePercent());
  }

  protected etapeDotClass(type: TypeEtape): string {
    return ETAPE_DOT_CLASS[type];
  }

  protected etapeTimesLabel(etape: Etape): string {
    const parts = [`ETA ${formatInstant(etape.eta)}`];
    if (etape.etd) {
      parts.push(`ETD ${formatInstant(etape.etd)}`);
    }
    return parts.join(" · ");
  }

  protected statutBadgeType(statut: StatutVoyage): ZardBadgeTypeVariants {
    return apercuToneToBadgeType(voyageStatutTone(statut));
  }

  protected onEventType(value: string): void {
    if (isTypeEvenement(value)) {
      this.eventType.set(value);
    }
  }

  protected onEventComment(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.eventComment.set(target.value);
    }
  }

  protected onEventLatitude(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.eventLatitude.set(target.value);
    }
  }

  protected onEventLongitude(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.eventLongitude.set(target.value);
    }
  }

  protected onDossierAjoute(): void {
    this.voyage.reload();
    this.dossiers.reload();
    this.capacityView()?.reload();
  }

  protected async changerStatut(valeur: StatutVoyage): Promise<void> {
    this.statutError.set(null);
    try {
      await this.api.changerStatut(this.id(), valeur);
      this.voyage.reload();
      this.toast.success("Statut du voyage mis à jour.");
    } catch (error) {
      // Second statut change 500s until VoyageRepositoryAdapter updates
      // in place (same pattern as VehiculeRepositoryAdapter).
      this.statutError.set(httpErrorMessage(error));
    }
  }

  protected async declarerEvenement(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.eventError.set(null);
    const commentaire = this.eventComment().trim();
    const horodatageLocal = this.eventHorodatage().trim();
    if (horodatageLocal.length === 0) {
      this.eventError.set("La date et l'heure sont obligatoires.");
      return;
    }
    const minimum = this.minEventHorodatage();
    if (minimum && compareDatetimeLocal(horodatageLocal, minimum) < 0) {
      this.eventError.set(
        `La date et l'heure doivent être postérieures ou égales au dernier événement (${formatDatetimeLocalForDisplay(minimum)}).`
      );
      return;
    }
    let horodatage: string;
    try {
      horodatage = datetimeLocalToIso(horodatageLocal);
    } catch {
      this.eventError.set("Date ou heure invalide.");
      return;
    }
    const position = this.parseEventPosition();
    if (position === undefined) {
      return;
    }
    try {
      await this.api.declarerEvenement({
        commentaire: commentaire.length > 0 ? commentaire : null,
        horodatage,
        position,
        type: this.eventType(),
        voyageId: this.id(),
      });
      this.evenements.reload();
      this.eventHorodatage.set(
        maxDatetimeLocal(horodatageLocal, toDatetimeLocal(new Date()))
      );
      this.eventComment.set("");
      this.eventLatitude.set("");
      this.eventLongitude.set("");
      this.toast.success("Événement enregistré.");
    } catch (error) {
      this.eventError.set(httpErrorMessage(error));
    }
  }

  private parseEventPosition(): GeoPoint | null | undefined {
    const latRaw = this.eventLatitude().trim();
    const lngRaw = this.eventLongitude().trim();
    if (latRaw.length === 0 && lngRaw.length === 0) {
      return null;
    }
    const latitude = Number(latRaw);
    const longitude = Number(lngRaw);
    if (Number.isNaN(latitude) || latRaw.length === 0) {
      this.eventError.set("La latitude doit être un nombre valide.");
      return undefined;
    }
    if (Number.isNaN(longitude) || lngRaw.length === 0) {
      this.eventError.set("La longitude doit être un nombre valide.");
      return undefined;
    }
    if (latitude < -90 || latitude > 90) {
      this.eventError.set("La latitude doit être comprise entre -90 et 90.");
      return undefined;
    }
    if (longitude < -180 || longitude > 180) {
      this.eventError.set("La longitude doit être comprise entre -180 et 180.");
      return undefined;
    }
    return { latitude, longitude };
  }
}
