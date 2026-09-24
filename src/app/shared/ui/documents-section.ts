import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import {
  etatValidite,
  etatValiditeLabel,
  etatValiditeTone,
} from "../../chauffeurs/chauffeur";
import { httpErrorMessage } from "../../core/api/http-error";
import {
  DOCUMENT_TYPES_PAR_ENTITE,
  type Document,
  type DocumentType,
  documentTypeLabel,
  formatDocumentExpiration,
  isDocumentType,
  type TypeEntiteDocumentable,
} from "../../documents/document";
import { DocumentApi } from "../../documents/document-api";
import { enumToSelectOptions } from "./field-select";
import { FORM_PAGE_IMPORTS } from "./form-page";
import { StatutChip } from "./statut-chip";
import { ToastService } from "./toast";

/**
 * Pièces justificatives d'une entité (liste, ouverture, suppression, téléversement).
 * Tous les documents sont optionnels : référence et date d'expiration aussi ;
 * quand l'expiration est renseignée, son état (valide / bientôt / expiré) est affiché.
 */
@Component({
  imports: [StatutChip, ...FORM_PAGE_IMPORTS],
  selector: "app-documents-section",
  template: `
    <app-form-section [description]="description()" title="Documents">
      @if (documents.isLoading()) {
        <p class="text-sm text-muted" role="status">Chargement…</p>
      } @else if (documents.error()) {
        <div class="alert-panel" role="alert">
          <p>{{ erreurChargement() }}</p>
          <button
            (click)="documents.reload()"
            class="pressable mt-2 font-medium text-ink underline underline-offset-2"
            type="button"
          >
            Réessayer
          </button>
        </div>
      } @else if (documents.hasValue()) {
        @if (documents.value().length === 0) {
          <p class="text-sm text-muted">Aucun document (facultatif).</p>
        } @else {
          <ul class="flex flex-col gap-2">
            @for (document of documents.value(); track document.id) {
              <li
                class="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-line/80 bg-canvas px-3 py-3"
              >
                <div class="min-w-0 flex-1 text-sm">
                  <p class="flex flex-wrap items-center gap-2 font-medium text-ink">
                    {{ documentTypeLabel(document.typeDocument) }}
                    @if (document.dateExpiration) {
                      <app-statut-chip
                        [label]="etatLabel(document.dateExpiration)"
                        [tone]="etatTone(document.dateExpiration)"
                      />
                    }
                  </p>
                  @if (document.reference) {
                    <p class="mt-1 text-muted">{{ document.reference }}</p>
                  }
                  @if (document.dateExpiration) {
                    <p class="mt-1 font-mono text-xs tabular-nums text-muted">
                      Expire le {{ formatDocumentExpiration(document.dateExpiration) }}
                    </p>
                  }
                  @if (document.url) {
                    <a
                      [href]="document.url"
                      class="mt-2 inline-block text-xs text-pine underline-offset-2 hover:underline"
                      rel="noopener"
                      target="_blank"
                    >
                      Ouvrir le fichier
                    </a>
                  }
                </div>
                <button
                  (click)="supprimer(document.id)"
                  [attr.aria-label]="'Supprimer ' + documentTypeLabel(document.typeDocument)"
                  class="btn-danger-outline pressable h-11 px-3 text-xs"
                  type="button"
                >
                  Supprimer
                </button>
              </li>
            }
          </ul>
        }

        <details class="fiche-disclosure fiche-inset">
          <summary class="text-sm font-medium text-ink">Téléverser un document</summary>
          <form (submit)="televerser($event)" class="mt-4" novalidate>
            <app-form-field [inputId]="prefixe() + '-fichier'" label="Fichier *">
              <input
                (change)="onFichier($event)"
                [id]="prefixe() + '-fichier'"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                class="field"
                type="file"
              />
            </app-form-field>
            <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <app-form-field [inputId]="prefixe() + '-type'" label="Type">
                <app-field-select
                  (selectValueChange)="onType($event)"
                  [inputId]="prefixe() + '-type'"
                  [options]="typeOptions()"
                  [selectValue]="typeDocument()"
                />
              </app-form-field>
              <app-form-field [inputId]="prefixe() + '-reference'" label="Référence">
                <input
                  (input)="onReference($event)"
                  [id]="prefixe() + '-reference'"
                  [value]="reference()"
                  class="field"
                  placeholder="Facultatif"
                  type="text"
                />
              </app-form-field>
              <app-form-field [inputId]="prefixe() + '-expiration'" label="Expiration">
                <app-iso-date-input
                  (isoDateChange)="expiration.set($event)"
                  [inputId]="prefixe() + '-expiration'"
                  [isoDate]="expiration()"
                />
              </app-form-field>
            </div>
            @if (erreur()) {
              <div class="alert-panel mt-3" role="alert">{{ erreur() }}</div>
            }
            <app-form-actions>
              <button
                [disabled]="envoi()"
                class="btn-primary pressable min-h-11 px-5"
                type="submit"
              >
                {{ envoi() ? "Envoi…" : "Téléverser" }}
              </button>
            </app-form-actions>
          </form>
        </details>
      }
    </app-form-section>
  `,
})
export class DocumentsSection {
  private readonly documentApi = inject(DocumentApi);
  private readonly toast = inject(ToastService);

  readonly typeEntite = input.required<TypeEntiteDocumentable>();
  readonly entiteId = input.required<string>();
  readonly description = input(
    "Pièces justificatives facultatives ; l'expiration renseignée est suivie."
  );

  protected readonly documentTypeLabel = documentTypeLabel;
  protected readonly formatDocumentExpiration = formatDocumentExpiration;

  protected readonly prefixe = computed(
    () => `doc-${this.typeEntite().toLowerCase()}`
  );
  protected readonly typeOptions = computed(() =>
    enumToSelectOptions(
      DOCUMENT_TYPES_PAR_ENTITE[this.typeEntite()],
      documentTypeLabel
    )
  );

  protected readonly fichier = signal<File | null>(null);
  protected readonly typeDocumentChoisi = signal<DocumentType | null>(null);
  protected readonly typeDocument = computed(
    () =>
      this.typeDocumentChoisi() ??
      DOCUMENT_TYPES_PAR_ENTITE[this.typeEntite()][0] ??
      "AUTRE"
  );
  protected readonly reference = signal("");
  protected readonly expiration = signal("");
  protected readonly erreur = signal<string | null>(null);
  protected readonly envoi = signal(false);

  protected readonly documents = httpResource<Document[]>(() => ({
    params: { entiteId: this.entiteId(), typeEntite: this.typeEntite() },
    url: `${environment.apiBaseUrl}/documents`,
  }));

  protected readonly erreurChargement = computed(() =>
    httpErrorMessage(this.documents.error())
  );

  private readonly aujourdhui = new Date();

  protected etatLabel(dateExpiration: string): string {
    return etatValiditeLabel(etatValidite(dateExpiration, this.aujourdhui));
  }

  protected etatTone(dateExpiration: string) {
    return etatValiditeTone(etatValidite(dateExpiration, this.aujourdhui));
  }

  protected onType(valeur: string): void {
    if (isDocumentType(valeur)) {
      this.typeDocumentChoisi.set(valeur);
    }
  }

  protected onReference(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.reference.set(event.target.value);
    }
  }

  protected onFichier(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.fichier.set(event.target.files?.[0] ?? null);
    }
  }

  protected async televerser(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.erreur.set(null);
    const fichier = this.fichier();
    if (!fichier) {
      this.erreur.set("Choisissez un fichier à téléverser.");
      return;
    }
    this.envoi.set(true);
    try {
      await this.documentApi.televerser({
        dateExpiration: this.expiration() || undefined,
        entiteId: this.entiteId(),
        fichier,
        reference: this.reference(),
        typeDocument: this.typeDocument(),
        typeEntite: this.typeEntite(),
      });
      this.fichier.set(null);
      this.reference.set("");
      this.expiration.set("");
      if (event.target instanceof HTMLFormElement) {
        event.target.reset();
      }
      this.documents.reload();
      this.toast.success("Document téléversé.");
    } catch (error) {
      this.erreur.set(httpErrorMessage(error));
    } finally {
      this.envoi.set(false);
    }
  }

  protected async supprimer(documentId: string): Promise<void> {
    this.erreur.set(null);
    try {
      await this.documentApi.supprimer(documentId);
      this.documents.reload();
      this.toast.success("Document supprimé.");
    } catch (error) {
      this.erreur.set(httpErrorMessage(error));
    }
  }
}
