import { Component, inject, signal } from "@angular/core";
import { FormField, form, min, required, submit } from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { httpErrorMessage } from "../core/api/http-error";
import { firstFieldError } from "../core/forms/first-field-error";
import {
  type CommandeDraft,
  draftToWrite,
  emptyCommandeDraft,
} from "./commande";
import { CommandeApi } from "./commande-api";

@Component({
  imports: [FormField, RouterLink],
  selector: "app-commande-create-page",
  templateUrl: "./commande-create-page.html",
})
export class CommandeCreatePage {
  private readonly api = inject(CommandeApi);
  private readonly router = inject(Router);

  protected readonly firstFieldError = firstFieldError;
  protected readonly formError = signal<string | null>(null);

  protected readonly draft = signal(emptyCommandeDraft());

  protected readonly createForm = form(this.draft, (path) => {
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

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.createForm, async () => {
      const draft = this.draft();
      try {
        const clientId = await this.resolveClientId(draft);
        const created = await this.api.create(draftToWrite(draft, clientId));
        await this.router.navigate(["/commandes", created.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }

  private async resolveClientId(draft: CommandeDraft): Promise<string> {
    if (!draft.nouveauClient) {
      const existing = draft.clientId.trim();
      if (existing.length === 0) {
        throw new Error("L'identifiant client est obligatoire.");
      }
      return existing;
    }
    const code = draft.clientCode.trim().toUpperCase();
    const raisonSociale = draft.clientRaisonSociale.trim();
    if (code.length === 0 || raisonSociale.length === 0) {
      throw new Error(
        "Le code et la raison sociale du client sont obligatoires."
      );
    }
    const client = await this.api.createClient({ code, raisonSociale });
    return client.id;
  }
}
