import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { bindShellBreadcrumbLeaf } from "../core/nav/shell-breadcrumb-leaf";
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
import type { PageResponse } from "../core/api/page-response";
import { DemoSessionService } from "../core/auth/demo-session";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { WORK_DESTINATIONS } from "../core/nav/work-destination";
import {
  DOCUMENT_TYPES,
  type Document,
  documentTypeLabel,
  emptyDocumentUploadDraft,
  formatDocumentExpiration,
  isDocumentType,
} from "../documents/document";
import { DocumentApi } from "../documents/document-api";
import {
  formatDateTime,
  formatMoney,
  formatOrdreShortId,
  type OrdreTravail,
  statutOtLabel,
  statutOtTone,
  typeInterventionLabel,
} from "../maintenance/ordre-travail";
import {
  formatPeriodicite,
  type PlanEntretien,
} from "../maintenance/plan-entretien";
import {
  draftToWrite,
  emptyScoreSanteDraft,
  formatDate,
  SCORE_SANTE_MAX,
  type ScoreSante,
  statutSanteLabel,
  statutSanteTone,
} from "../maintenance/score-sante";
import { ScoreSanteApi } from "../maintenance/score-sante-api";
import { enumToSelectOptions } from "../shared/ui/field-select";
import { statutOptionsFrom } from "../shared/ui/list-filter";
import { vehiculeStatutIcon } from "../shared/ui/list-statut-icons";
import { statutIconForValue } from "../shared/ui/list-statut-filter";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { StatutChip } from "../shared/ui/statut-chip";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import { ToastService } from "../shared/ui/toast";
import { vehiculeStatutTone } from "../tableau/apercu";
import {
  carrosserieDisplay,
  energieDisplay,
  formatMarqueModele,
  formatVehiculeDate,
  statutLabel,
  typeLabel,
  VEHICULE_STATUTS,
  type Vehicule,
} from "./vehicule";
import { VehiculeApi } from "./vehicule-api";

@Component({
  imports: [FormField, NgIcon, RouterLink, StatutChip, ...FICHE_PAGE_IMPORTS],
  selector: "app-vehicule-detail-page",
  templateUrl: "./vehicule-detail-page.html",
  viewProviders: [provideIcons({ lucideCheck })],
})
export class VehiculeDetailPage {
  private readonly api = inject(VehiculeApi);
  private readonly documentApi = inject(DocumentApi);
  private readonly scoreApi = inject(ScoreSanteApi);
  private readonly session = inject(DemoSessionService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required<string>();

  protected readonly statutOptions = statutOptionsFrom(
    VEHICULE_STATUTS,
    statutLabel,
    vehiculeStatutIcon
  );
  protected readonly documentTypes = DOCUMENT_TYPES;
  protected readonly documentTypeOptions = enumToSelectOptions(
    DOCUMENT_TYPES,
    documentTypeLabel
  );
  protected readonly documentTypeLabel = documentTypeLabel;
  protected readonly formatDocumentExpiration = formatDocumentExpiration;
  protected readonly typeLabel = typeLabel;
  protected readonly statutLabel = statutLabel;
  protected readonly energieDisplay = energieDisplay;
  protected readonly carrosserieDisplay = carrosserieDisplay;
  protected readonly formatMarqueModele = formatMarqueModele;
  protected readonly formatVehiculeDate = formatVehiculeDate;
  protected readonly vehiculeStatutTone = vehiculeStatutTone;

  protected statutChipIcon(statut: string): string | null {
    return statutIconForValue(this.statutOptions, statut);
  }

  protected readonly statutSanteLabel = statutSanteLabel;
  protected readonly statutSanteTone = statutSanteTone;
  protected readonly formatScoreDate = formatDate;
  protected readonly formatPeriodicite = formatPeriodicite;
  protected readonly formatDateTime = formatDateTime;
  protected readonly formatMoney = formatMoney;
  protected readonly formatOrdreShortId = formatOrdreShortId;
  protected readonly typeInterventionLabel = typeInterventionLabel;
  protected readonly statutOtLabel = statutOtLabel;
  protected readonly statutOtTone = statutOtTone;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;

  protected readonly canMaintenance = computed(() =>
    this.session.hasAnyRole(WORK_DESTINATIONS.maintenance.roles)
  );

  protected readonly compteursError = signal<string | null>(null);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly scoreError = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploadDraft = signal(emptyDocumentUploadDraft());

  protected readonly vehicule = httpResource<Vehicule>(() => ({
    url: `${environment.apiBaseUrl}/vehicules/${this.id()}`,
  }));

  protected readonly documents = httpResource<Document[]>(() => ({
    params: { entiteId: this.id(), typeEntite: "VEHICULE" },
    url: `${environment.apiBaseUrl}/documents`,
  }));

  protected readonly scoreSante = httpResource<ScoreSante | null>(() => ({
    params: { vehiculeId: this.id() },
    url: `${environment.apiBaseUrl}/scores-sante/dernier`,
  }));

  protected readonly plansEntretien = httpResource<
    PageResponse<PlanEntretien> | undefined
  >(() => {
    if (!this.canMaintenance()) {
      return;
    }
    return {
      params: { page: 0, size: 5, vehiculeId: this.id() },
      url: `${environment.apiBaseUrl}/plans-entretien`,
    };
  });

  protected readonly plansEntretienList = computed(
    () => this.plansEntretien.value()?.content ?? []
  );

  protected readonly ordresTravail = httpResource<
    PageResponse<OrdreTravail> | undefined
  >(() => {
    if (!this.canMaintenance()) {
      return;
    }
    return {
      params: { page: 0, size: 5, vehiculeId: this.id() },
      url: `${environment.apiBaseUrl}/ordres-travail`,
    };
  });

  protected readonly ordresTravailList = computed(
    () => this.ordresTravail.value()?.content ?? []
  );

  protected readonly loadError = computed(() => {
    const error = this.vehicule.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly documentsLoadError = computed(() => {
    const error = this.documents.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly scoreLoadError = computed(() => {
    const error = this.scoreSante.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly plansLoadError = computed(() => {
    const error = this.plansEntretien.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly ordresLoadError = computed(() => {
    const error = this.ordresTravail.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly scoreDraft = signal(emptyScoreSanteDraft());

  protected readonly scoreForm = form(this.scoreDraft, (path) => {
    required(path.score, { message: "Le score est obligatoire." });
    min(path.score, 0, { message: "Le score ne peut pas être négatif." });
    max(path.score, SCORE_SANTE_MAX, {
      message: `Le score ne peut pas dépasser ${SCORE_SANTE_MAX}.`,
    });
    required(path.dateEcheanceProjetee, {
      message: "La date d'échéance est obligatoire.",
    });
  });

  protected readonly compteursDraft = signal({
    heuresMoteur: 0,
    kilometrage: 0,
  });

  protected readonly compteursForm = form(this.compteursDraft, (path) => {
    required(path.kilometrage, { message: "Le kilométrage est obligatoire." });
    min(path.kilometrage, 0, {
      message: "Le kilométrage ne peut pas être négatif.",
    });
    required(path.heuresMoteur, {
      message: "Les heures moteur sont obligatoires.",
    });
    min(path.heuresMoteur, 0, {
      message: "Les heures moteur ne peuvent pas être négatives.",
    });
  });

  private seededForId = "";

  constructor() {
    bindShellBreadcrumbLeaf(
      this.destroyRef,
      computed(() =>
        this.vehicule.hasValue()
          ? this.vehicule.value().immatriculation
          : null
      )
    );

    effect(() => {
      const id = this.id();
      const current = this.vehicule.value();
      if (!current || current.id !== id || this.seededForId === id) {
        return;
      }
      this.seededForId = id;
      this.compteursDraft.set({
        heuresMoteur: current.heuresMoteur,
        kilometrage: current.kilometrage,
      });
    });
  }

  protected onUploadType(typeDocument: string): void {
    if (isDocumentType(typeDocument)) {
      this.uploadDraft.update((draft) => ({
        ...draft,
        typeDocument,
      }));
    }
  }

  protected onUploadReference(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.uploadDraft.update((draft) => ({
        ...draft,
        reference: target.value,
      }));
    }
  }

  protected onUploadExpirationIso(isoDate: string): void {
    this.uploadDraft.update((draft) => ({
      ...draft,
      dateExpiration: isoDate,
    }));
  }

  protected onFileSelected(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.selectedFile.set(target.files?.[0] ?? null);
    }
  }

  protected async saveCompteurs(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.compteursError.set(null);
    await submit(this.compteursForm, async () => {
      const draft = this.compteursDraft();
      try {
        const updated = await this.api.relever(
          this.id(),
          draft.kilometrage,
          draft.heuresMoteur
        );
        this.compteursDraft.set({
          heuresMoteur: updated.heuresMoteur,
          kilometrage: updated.kilometrage,
        });
        this.vehicule.reload();
        this.toast.success("Compteurs enregistrés.");
      } catch (error) {
        this.compteursError.set(httpErrorMessage(error));
      }
    });
  }

  protected async uploadDocument(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.uploadError.set(null);

    const file = this.selectedFile();
    if (!file) {
      this.uploadError.set("Choisissez un fichier à téléverser.");
      return;
    }

    const draft = this.uploadDraft();
    if (draft.reference.trim().length === 0) {
      this.uploadError.set("La référence du document est obligatoire.");
      return;
    }
    if (draft.dateExpiration.length === 0) {
      this.uploadError.set("La date d'expiration est obligatoire.");
      return;
    }

    try {
      await this.documentApi.televerser({
        dateExpiration: draft.dateExpiration,
        entiteId: this.id(),
        fichier: file,
        reference: draft.reference.trim(),
        typeDocument: draft.typeDocument,
        typeEntite: "VEHICULE",
      });
      this.selectedFile.set(null);
      this.uploadDraft.set(emptyDocumentUploadDraft());
      this.documents.reload();
      this.toast.success("Document téléversé.");
    } catch (error) {
      this.uploadError.set(httpErrorMessage(error));
    }
  }

  protected async deleteDocument(documentId: string): Promise<void> {
    this.uploadError.set(null);
    try {
      await this.documentApi.supprimer(documentId);
      this.documents.reload();
      this.toast.success("Document supprimé.");
    } catch (error) {
      this.uploadError.set(httpErrorMessage(error));
    }
  }

  protected async enregistrerScore(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.scoreError.set(null);
    await submit(this.scoreForm, async () => {
      try {
        await this.scoreApi.calculer(
          draftToWrite(this.id(), this.scoreDraft())
        );
        this.scoreSante.reload();
        this.toast.success("Score de santé enregistré.");
      } catch (error) {
        this.scoreError.set(httpErrorMessage(error));
      }
    });
  }
}
