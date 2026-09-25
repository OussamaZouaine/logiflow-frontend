import { DatePipe } from "@angular/common";
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
import { FormField, form, required, submit } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { DemoSessionService } from "../core/auth/demo-session";
import { VOYAGES_PLAN_ROLES } from "../core/auth/role";
import {
  DOCUMENT_TYPES,
  type Document,
  type DocumentUploadDraft,
  documentTypeLabel,
  emptyDocumentUploadDraft,
  formatDocumentExpiration,
  isDocumentType,
} from "../documents/document";
import { DocumentApi } from "../documents/document-api";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { enumToSelectOptions } from "../shared/ui/field-select";
import { statutOptionsFrom } from "../shared/ui/list-filter";
import { priseCarburantStatutIcon } from "../shared/ui/list-statut-icons";
import { statutIconForValue } from "../shared/ui/list-statut-filter";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { StatutChip } from "../shared/ui/statut-chip";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import { ToastService } from "../shared/ui/toast";
import { PriseCarburantApi } from "./prise-carburant-api";
import {
  formatLitres,
  formatMontantTtc,
  formatPriseShortId,
  formatPrixUnitaire,
  STATUT_PRISES,
  statutPriseLabel,
  statutPriseTone,
  TYPE_CARBURANTS,
  type PriseCarburant,
  type PriseCarburantMaj,
  typeCarburantLabel,
} from "./prise-carburant";
import type { Station } from "./station";

interface PriseEditDraft {
  litrage: string;
  montantTtc: string;
  stationId: string;
  typeCarburant: (typeof TYPE_CARBURANTS)[number];
}

@Component({
  imports: [
    DatePipe,
    FormField,
    NgIcon,
    RouterLink,
    StatutChip,
    ...FICHE_PAGE_IMPORTS,
  ],
  selector: "app-prise-detail-page",
  templateUrl: "./prise-detail-page.html",
  viewProviders: [provideIcons({ lucideCheck })],
})
export class PriseDetailPage {
  private readonly api = inject(PriseCarburantApi);
  private readonly documentApi = inject(DocumentApi);
  private readonly session = inject(DemoSessionService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required<string>();

  protected readonly formatLitres = formatLitres;
  protected readonly formatMontantTtc = formatMontantTtc;
  protected readonly formatPrixUnitaire = formatPrixUnitaire;
  protected readonly formatPriseShortId = formatPriseShortId;
  protected readonly statutOptions = statutOptionsFrom(
    STATUT_PRISES,
    statutPriseLabel,
    priseCarburantStatutIcon
  );
  protected readonly statutPriseLabel = statutPriseLabel;
  protected readonly statutPriseTone = statutPriseTone;

  protected statutChipIcon(statut: string): string | null {
    return statutIconForValue(this.statutOptions, statut);
  }
  protected readonly typeCarburantLabel = typeCarburantLabel;
  protected readonly fuelTypes = TYPE_CARBURANTS;
  protected readonly documentTypeLabel = documentTypeLabel;
  protected readonly formatDocumentExpiration = formatDocumentExpiration;
  protected readonly documentTypes = DOCUMENT_TYPES;
  protected readonly documentTypeOptions = enumToSelectOptions(
    ["JUSTIFICATIF_CARBURANT", "AUTRE", "PHOTO"] as const,
    documentTypeLabel
  );
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;

  protected readonly formError = signal<string | null>(null);
  protected readonly validateError = signal<string | null>(null);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploadDraft = signal<DocumentUploadDraft>({
    ...emptyDocumentUploadDraft(),
    typeDocument: "JUSTIFICATIF_CARBURANT",
  });

  protected readonly prise = httpResource<PriseCarburant>(() => ({
    url: `${environment.apiBaseUrl}/prises-carburant/${this.id()}`,
  }));

  protected readonly stations = httpResource<PageResponse<Station>>(() => ({
    params: { page: 0, size: 100 },
    url: `${environment.apiBaseUrl}/stations`,
  }));

  protected readonly documents = httpResource<Document[]>(() => ({
    params: {
      entiteId: this.id(),
      typeEntite: "PRISE_CARBURANT",
    },
    url: `${environment.apiBaseUrl}/documents`,
  }));

  protected readonly editDraft = signal<PriseEditDraft>({
    litrage: "",
    montantTtc: "",
    stationId: "",
    typeCarburant: "DIESEL",
  });

  protected readonly canValidate = computed(() => {
    const roles = this.session.session()?.roles ?? [];
    return roles.some((role) => VOYAGES_PLAN_ROLES.includes(role));
  });

  protected readonly isEditable = computed(
    () => this.prise.value()?.statut === "BROUILLON"
  );

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.prise.error())
  );

  protected readonly documentsLoadError = computed(() =>
    httpErrorMessage(this.documents.error())
  );

  protected readonly editForm = form(this.editDraft, (path) => {
    required(path.stationId, { message: "La station est obligatoire." });
    required(path.litrage, { message: "Le litrage est obligatoire." });
    required(path.montantTtc, { message: "Le montant est obligatoire." });
  });

  constructor() {
    bindShellBreadcrumbLeaf(
      this.destroyRef,
      computed(() =>
        this.prise.hasValue()
          ? formatPriseShortId(this.prise.value().id)
          : null
      )
    );

    effect(() => {
      const current = this.prise.value();
      if (!current) {
        return;
      }
      this.editDraft.set({
        litrage: String(current.litrage),
        montantTtc: String(current.montantTtc),
        stationId: current.stationId,
        typeCarburant: current.typeCarburant,
      });
    });
  }

  protected onStationChange(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLSelectElement) {
      this.editDraft.update((current) => ({
        ...current,
        stationId: target.value,
      }));
    }
  }

  protected onTypeChange(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLSelectElement) {
      this.editDraft.update((current) => ({
        ...current,
        typeCarburant: target.value as PriseEditDraft["typeCarburant"],
      }));
    }
  }

  protected async saveEdits(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.editForm, async () => {
      try {
        const draft = this.editDraft();
        const body: PriseCarburantMaj = {
          litrage: Number.parseFloat(draft.litrage),
          montantTtc: Number.parseFloat(draft.montantTtc),
          stationId: draft.stationId,
          typeCarburant: draft.typeCarburant,
        };
        await this.api.update(this.id(), body);
        this.toast.success("Prise mise à jour.");
        this.prise.reload();
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }

  protected async valider(): Promise<void> {
    this.validateError.set(null);
    try {
      await this.api.valider(this.id());
      this.toast.success("Prise validée.");
      this.prise.reload();
    } catch (error) {
      this.validateError.set(httpErrorMessage(error));
    }
  }

  protected onFileSelected(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement && target.files?.[0]) {
      this.selectedFile.set(target.files[0]);
    }
  }

  protected onUploadType(value: string): void {
    if (isDocumentType(value)) {
      this.uploadDraft.update((current) => ({
        ...current,
        typeDocument: value,
      }));
    }
  }

  protected async uploadDocument(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.uploadError.set(null);
    const file = this.selectedFile();
    if (!file) {
      this.uploadError.set("Choisissez un fichier.");
      return;
    }
    try {
      await this.documentApi.televerser({
        entiteId: this.id(),
        fichier: file,
        reference: this.uploadDraft().reference || undefined,
        typeDocument: this.uploadDraft().typeDocument,
        typeEntite: "PRISE_CARBURANT",
      });
      this.toast.success("Document téléversé.");
      this.selectedFile.set(null);
      this.documents.reload();
    } catch (error) {
      this.uploadError.set(httpErrorMessage(error));
    }
  }

  protected async deleteDocument(documentId: string): Promise<void> {
    try {
      await this.documentApi.supprimer(documentId);
      this.toast.success("Document supprimé.");
      this.documents.reload();
    } catch (error) {
      this.toast.error(httpErrorMessage(error));
    }
  }
}
