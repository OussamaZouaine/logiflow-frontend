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
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
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
import { EnginMaintenanceSection } from "../maintenance/engin-maintenance-section";
import { enumToSelectOptions } from "../shared/ui/field-select";
import { statutOptionsFrom } from "../shared/ui/list-filter";
import { vehiculeStatutIcon } from "../shared/ui/list-statut-icons";
import { statutIconForValue } from "../shared/ui/list-statut-filter";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { enumToSelectOptions } from "../shared/ui/field-select";
import { StatutChip } from "../shared/ui/statut-chip";
import { ToastService } from "../shared/ui/toast";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import {
  carrosserieDisplay,
  formatMarqueModele,
  formatRemorqueDate,
  type Remorque,
  remorqueStatutLabel,
  remorqueStatutTone,
  typeRemorqueDisplay,
  VEHICULE_STATUTS,
  type Remorque,
} from "./remorque";
import { RemorqueApi } from "./remorque-api";

@Component({
  imports: [
    EnginMaintenanceSection,
    FormField,
    NgIcon,
    StatutChip,
    ...FICHE_PAGE_IMPORTS,
  ],
  selector: "app-remorque-detail-page",
  templateUrl: "./remorque-detail-page.html",
  viewProviders: [provideIcons({ lucideCheck })],
})
export class RemorqueDetailPage {
  private readonly api = inject(RemorqueApi);
  private readonly documentApi = inject(DocumentApi);
  private readonly toast = inject(ToastService);
  private readonly session = inject(DemoSessionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required<string>();

  protected readonly canMaintenance = computed(() =>
    this.session.hasAnyRole(WORK_DESTINATIONS.maintenance.roles)
  );

  protected readonly statutOptions = statutOptionsFrom(
    VEHICULE_STATUTS,
    remorqueStatutLabel,
    vehiculeStatutIcon
  );
  protected readonly documentTypes = DOCUMENT_TYPES;
  protected readonly documentTypeOptions = enumToSelectOptions(
    DOCUMENT_TYPES,
    documentTypeLabel
  );
  protected readonly documentTypeLabel = documentTypeLabel;
  protected readonly formatDocumentExpiration = formatDocumentExpiration;
  protected readonly carrosserieDisplay = carrosserieDisplay;
  protected readonly formatMarqueModele = formatMarqueModele;
  protected readonly formatRemorqueDate = formatRemorqueDate;
  protected readonly remorqueStatutLabel = remorqueStatutLabel;
  protected readonly remorqueStatutTone = remorqueStatutTone;

  protected statutChipIcon(statut: string): string | null {
    return statutIconForValue(this.statutOptions, statut);
  }
  protected readonly typeRemorqueDisplay = typeRemorqueDisplay;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly compteursError = signal<string | null>(null);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploadDraft = signal(emptyDocumentUploadDraft());

  protected readonly remorque = httpResource<Remorque>(() => ({
    url: `${environment.apiBaseUrl}/remorques/${this.id()}`,
  }));

  protected readonly documents = httpResource<Document[]>(() => ({
    params: { entiteId: this.id(), typeEntite: "REMORQUE" },
    url: `${environment.apiBaseUrl}/documents`,
  }));

  protected readonly loadError = computed(() => {
    const error = this.remorque.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly documentsLoadError = computed(() => {
    const error = this.documents.error();
    return error ? httpErrorMessage(error) : null;
  });

  protected readonly compteursDraft = signal({
    heuresGroupeFroid: 0,
    kilometrage: 0,
  });

  protected readonly compteursForm = form(this.compteursDraft, (path) => {
    required(path.kilometrage, { message: "Le kilométrage est obligatoire." });
    min(path.kilometrage, 0, {
      message: "Le kilométrage ne peut pas être négatif.",
    });
    required(path.heuresGroupeFroid, {
      message: "Les heures groupe froid sont obligatoires.",
    });
    min(path.heuresGroupeFroid, 0, {
      message: "Les heures groupe froid ne peuvent pas être négatives.",
    });
  });

  private seededForId = "";

  constructor() {
    bindShellBreadcrumbLeaf(
      this.destroyRef,
      computed(() =>
        this.remorque.hasValue()
          ? this.remorque.value().immatriculation
          : null
      )
    );

    effect(() => {
      const id = this.id();
      const current = this.remorque.value();
      if (!current || current.id !== id || this.seededForId === id) {
        return;
      }
      this.seededForId = id;
      this.compteursDraft.set({
        heuresGroupeFroid: current.heuresGroupeFroid,
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
        typeEntite: "REMORQUE",
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

  protected async releverCompteurs(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.compteursError.set(null);
    await submit(this.compteursForm, async () => {
      const draft = this.compteursDraft();
      try {
        await this.api.relever(
          this.id(),
          draft.kilometrage,
          draft.heuresGroupeFroid
        );
        this.remorque.reload();
        this.toast.success("Compteurs enregistrés.");
      } catch (error) {
        this.compteursError.set(httpErrorMessage(error));
      }
    });
  }
}
