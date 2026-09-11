import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { ListEmptyState } from "../shared/ui/list-empty-state";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  formatDateTime,
  formatMoney,
  rememberedOrdres,
  statutOtLabel,
  statutOtTone,
  typeInterventionLabel,
} from "./ordre-travail";

@Component({
  imports: [RouterLink, StatutChip, ListEmptyState],
  selector: "app-maintenance-page",
  templateUrl: "./maintenance-page.html",
})
export class MaintenancePage {
  private readonly router = inject(Router);

  protected readonly formatDateTime = formatDateTime;
  protected readonly formatMoney = formatMoney;
  protected readonly statutOtLabel = statutOtLabel;
  protected readonly statutOtTone = statutOtTone;
  protected readonly typeInterventionLabel = typeInterventionLabel;

  protected readonly lookupDraft = signal("");
  protected readonly ordres = signal(rememberedOrdres());

  protected onLookupInput(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.lookupDraft.set(target.value);
    }
  }

  protected async openById(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const id = this.lookupDraft().trim();
    if (id.length === 0) {
      return;
    }
    await this.router.navigate(["/maintenance", id]);
  }
}
