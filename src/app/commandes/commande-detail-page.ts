import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import {
  type Commande,
  formatDate,
  formatMoney,
  statutCommandeLabel,
} from "./commande";
import { CommandeApi } from "./commande-api";

@Component({
  imports: [RouterLink],
  selector: "app-commande-detail-page",
  templateUrl: "./commande-detail-page.html",
})
export class CommandeDetailPage {
  private readonly api = inject(CommandeApi);

  readonly id = input.required<string>();

  protected readonly formatDate = formatDate;
  protected readonly formatMoney = formatMoney;
  protected readonly statutCommandeLabel = statutCommandeLabel;

  protected readonly actionError = signal<string | null>(null);

  protected readonly commande = httpResource<Commande>(() => ({
    url: `${environment.apiBaseUrl}/commandes/${this.id()}`,
  }));

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.commande.error())
  );

  protected async confirmer(): Promise<void> {
    this.actionError.set(null);
    try {
      await this.api.confirmer(this.id());
      this.commande.reload();
    } catch (error) {
      // Second save 500s until CommandeRepositoryAdapter updates in place.
      this.actionError.set(httpErrorMessage(error));
    }
  }

  protected async annuler(): Promise<void> {
    this.actionError.set(null);
    try {
      await this.api.annuler(this.id());
      this.commande.reload();
    } catch (error) {
      // Annuler also save()s — same optimistic-lock 500 after an earlier
      // confirmer. Backend: in-place update in CommandeRepositoryAdapter.
      this.actionError.set(httpErrorMessage(error));
    }
  }
}
