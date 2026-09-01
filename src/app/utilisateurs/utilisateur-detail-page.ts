import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { FormField, form, required, submit } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { type Role, roleLabel } from "../core/auth/role";
import { firstFieldError } from "../core/forms/first-field-error";
import {
  draftToWrite,
  emptyUtilisateurDraft,
  UTILISATEUR_ROLES,
  type Utilisateur,
  utilisateurToDraft,
  withToggledRole,
} from "./utilisateur";
import { UtilisateurApi } from "./utilisateur-api";

@Component({
  imports: [FormField, RouterLink],
  selector: "app-utilisateur-detail-page",
  templateUrl: "./utilisateur-detail-page.html",
})
export class UtilisateurDetailPage {
  private readonly api = inject(UtilisateurApi);

  readonly id = input.required<string>();

  protected readonly roles = UTILISATEUR_ROLES;
  protected readonly roleLabel = roleLabel;
  protected readonly firstFieldError = firstFieldError;
  protected readonly formError = signal<string | null>(null);
  protected readonly deactivateError = signal<string | null>(null);

  protected readonly utilisateur = httpResource<Utilisateur>(() => ({
    url: `${environment.apiBaseUrl}/utilisateurs/${this.id()}`,
  }));

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.utilisateur.error())
  );

  protected readonly draft = signal(emptyUtilisateurDraft());

  protected readonly editForm = form(this.draft, (path) => {
    required(path.email, { message: "L'email est obligatoire." });
  });

  private seededForId = "";

  constructor() {
    effect(() => {
      const id = this.id();
      const current = this.utilisateur.value();
      if (!current || current.id !== id || this.seededForId === id) {
        return;
      }
      this.seededForId = id;
      this.draft.set(utilisateurToDraft(current));
    });
  }

  protected toggleRole(role: Role, event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.draft.update((current) =>
        withToggledRole(current, role, target.checked)
      );
    }
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    if (this.draft().roles.length === 0) {
      this.formError.set("Au moins un rôle est obligatoire.");
      return;
    }
    await submit(this.editForm, async () => {
      try {
        const updated = await this.api.update(
          this.id(),
          draftToWrite(this.draft())
        );
        this.draft.set(utilisateurToDraft(updated));
        this.utilisateur.reload();
      } catch (error) {
        // Second save 500s until UtilisateurRepositoryAdapter updates in
        // place (same pattern as VehiculeRepositoryAdapter).
        this.formError.set(httpErrorMessage(error));
      }
    });
  }

  protected async desactiver(): Promise<void> {
    this.deactivateError.set(null);
    try {
      await this.api.desactiver(this.id());
      this.seededForId = "";
      this.utilisateur.reload();
    } catch (error) {
      // DELETE also save()s the aggregate — same optimistic-lock 500 after
      // an earlier PUT. Backend: in-place update in UtilisateurRepositoryAdapter.
      this.deactivateError.set(httpErrorMessage(error));
    }
  }
}
