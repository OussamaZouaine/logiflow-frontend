import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import {
  DOCUMENT_TYPES,
  documentTypeLabel,
  isDocumentType,
  statutLabel,
  typeLabel,
  type Vehicule,
  type VehiculeDocument,
} from "./vehicule";
import { VehiculeApi } from "./vehicule-api";

@Component({
  imports: [FormField, RouterLink],
  selector: "app-vehicule-detail-page",
  templateUrl: "./vehicule-detail-page.html",
})
export class VehiculeDetailPage {
  private readonly api = inject(VehiculeApi);

  readonly id = input.required<string>();

  protected readonly documentTypes = DOCUMENT_TYPES;
  protected readonly documentTypeLabel = documentTypeLabel;
  protected readonly typeLabel = typeLabel;
  protected readonly statutLabel = statutLabel;

  protected readonly compteursError = signal<string | null>(null);
  protected readonly documentsError = signal<string | null>(null);

  protected readonly vehicule = httpResource<Vehicule>(() => ({
    url: `${environment.apiBaseUrl}/vehicules/${this.id()}`,
  }));

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.vehicule.error())
  );

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

  protected readonly documents = signal<VehiculeDocument[]>([]);

  private seededForId = "";

  constructor() {
    effect(() => {
      const id = this.id();
      const current = this.vehicule.value();
      if (!current || current.id !== id || this.seededForId === id) {
        return;
      }
      this.seededForId = id;
      this.applyVehicule(current);
    });
  }

  protected onDocumentType(index: number, event: Event): void {
    const { target } = event;
    if (target instanceof HTMLSelectElement) {
      this.setDocumentType(index, target.value);
    }
  }

  protected onDocumentReference(index: number, event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.setDocumentReference(index, target.value);
    }
  }

  protected onDocumentExpiration(index: number, event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.setDocumentExpiration(index, target.value);
    }
  }

  protected addDocument(): void {
    this.documents.update((list) => [
      ...list,
      { dateExpiration: "", reference: "", type: "CARTE_GRISE" },
    ]);
  }

  protected removeDocument(index: number): void {
    this.documents.update((list) => list.filter((_, i) => i !== index));
  }

  protected setDocumentType(index: number, value: string): void {
    if (!isDocumentType(value)) {
      return;
    }
    this.patchDocument(index, { type: value });
  }

  protected setDocumentReference(index: number, value: string): void {
    this.patchDocument(index, { reference: value });
  }

  protected setDocumentExpiration(index: number, value: string): void {
    this.patchDocument(index, { dateExpiration: value });
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
        this.applyVehicule(updated);
        this.vehicule.reload();
      } catch (error) {
        this.compteursError.set(httpErrorMessage(error));
      }
    });
  }

  protected async saveDocuments(): Promise<void> {
    this.documentsError.set(null);
    const current = this.vehicule.value();
    if (!current) {
      return;
    }
    const documents = this.documents();
    const incomplete = documents.some(
      (document) =>
        document.reference.trim().length === 0 ||
        document.dateExpiration.length === 0
    );
    if (incomplete) {
      this.documentsError.set(
        "Chaque document doit avoir une référence et une date d'expiration."
      );
      return;
    }
    try {
      const updated = await this.api.updateDocuments(this.id(), {
        chargeUtileKg: current.chargeUtileKg,
        documents: documents.map((document) => ({
          ...document,
          reference: document.reference.trim(),
        })),
        immatriculation: current.immatriculation,
        ptacKg: current.ptacKg,
        type: current.type,
      });
      this.applyVehicule(updated);
      this.vehicule.reload();
    } catch (error) {
      this.documentsError.set(httpErrorMessage(error));
    }
  }

  private applyVehicule(current: Vehicule): void {
    this.compteursDraft.set({
      heuresMoteur: current.heuresMoteur,
      kilometrage: current.kilometrage,
    });
    this.documents.set(current.documents.map((document) => ({ ...document })));
  }

  private patchDocument(index: number, patch: Partial<VehiculeDocument>): void {
    this.documents.update((list) =>
      list.map((document, i) =>
        i === index ? { ...document, ...patch } : document
      )
    );
  }
}
