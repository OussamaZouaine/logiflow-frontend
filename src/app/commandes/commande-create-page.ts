import { httpResource } from "@angular/common/http";
import { Component, computed, inject, signal } from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { ToastService } from "../shared/ui/toast";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { formatMarchandiseLabel, type Marchandise } from "../marchandises/marchandise";
import {
  type CommandeDraft,
  draftToWrite,
  emptyCommandeDraft,
  emptyLigneCommandeDraft,
  validateLignesCommande,
} from "./commande";
import { CommandeApi } from "./commande-api";

const LOOKUP_PAGE_SIZE = 50;

@Component({
  imports: [FormField, RouterLink],
  selector: "app-commande-create-page",
  templateUrl: "./commande-create-page.html",
})
export class CommandeCreatePage {
  private readonly api = inject(CommandeApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly formatMarchandiseLabel = formatMarchandiseLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly formError = signal<string | null>(null);
  protected readonly lignesError = signal<string | null>(null);

  protected readonly marchandises = httpResource<PageResponse<Marchandise>>(() => ({
    params: { page: 0, size: LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/marchandises`,
  }));

  protected readonly marchandiseOptions = computed(() =>
    (this.marchandises.value()?.content ?? []).filter(
      (marchandise) => marchandise.actif
    )
  );

  protected readonly marchandisesError = computed(() =>
    httpErrorMessage(this.marchandises.error())
  );

  protected readonly draft = signal(emptyCommandeDraft());

  protected readonly createForm = form(this.draft, (path) => {
    required(path.clientId, {
      message: "L'identifiant client est obligatoire.",
      when: ({ valueOf }) => !valueOf(path.nouveauClient),
    });
    required(path.clientCode, {
      message: "Le code client est obligatoire.",
      when: ({ valueOf }) => valueOf(path.nouveauClient),
    });
    required(path.clientRaisonSociale, {
      message: "La raison sociale est obligatoire.",
      when: ({ valueOf }) => valueOf(path.nouveauClient),
    });
    required(path.dateSouhaitee, {
      message: "La date souhaitée est obligatoire.",
    });
    min(path.montant, 0, { message: "Le montant ne peut pas être négatif." });
  });

  protected onNouveauClient(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.draft.update((current) => ({
        ...current,
        nouveauClient: target.checked,
      }));
    }
  }

  protected updateLigneMarchandise(index: number, event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    this.draft.update((current) => ({
      ...current,
      lignes: current.lignes.map((ligne, ligneIndex) =>
        ligneIndex === index
          ? { ...ligne, marchandiseId: target.value }
          : ligne
      ),
    }));
  }

  protected updateLigneNumber(
    index: number,
    field: "poidsKg" | "volumeM3" | "nbColis",
    event: Event
  ): void {
    const { target } = event;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const parsed = Number(target.value);
    if (Number.isNaN(parsed)) {
      return;
    }
    this.draft.update((current) => ({
      ...current,
      lignes: current.lignes.map((ligne, ligneIndex) =>
        ligneIndex === index ? { ...ligne, [field]: parsed } : ligne
      ),
    }));
  }

  protected addLigne(): void {
    this.lignesError.set(null);
    this.draft.update((current) => ({
      ...current,
      lignes: [...current.lignes, emptyLigneCommandeDraft()],
    }));
  }

  protected removeLigne(index: number): void {
    this.lignesError.set(null);
    this.draft.update((current) => ({
      ...current,
      lignes:
        current.lignes.length <= 1
          ? current.lignes
          : current.lignes.filter((_, ligneIndex) => ligneIndex !== index),
    }));
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    this.lignesError.set(null);

    const lignesValidation = validateLignesCommande(this.draft().lignes);
    if (lignesValidation) {
      this.lignesError.set(lignesValidation);
      return;
    }

    await submit(this.createForm, async () => {
      const draft = this.draft();
      try {
        const clientId = await this.resolveClientId(draft);
        const created = await this.api.create(draftToWrite(draft, clientId));
        this.toast.success("Commande créée.");
        await this.router.navigate(["/commandes", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }

  private async resolveClientId(draft: CommandeDraft): Promise<string> {
    if (!draft.nouveauClient) {
      return draft.clientId.trim();
    }
    const client = await this.api.createClient({
      code: draft.clientCode.trim().toUpperCase(),
      raisonSociale: draft.clientRaisonSociale.trim(),
    });
    return client.id;
  }
}
