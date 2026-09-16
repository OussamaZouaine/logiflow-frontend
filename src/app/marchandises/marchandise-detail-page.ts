import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { FicheHeader } from "../shared/ui/fiche-header";
import { ToastService } from "../shared/ui/toast";
import {
  actifLabel,
  actifTone,
  StatutChip,
} from "../shared/ui/statut-chip";
import {
  gerbableLabel,
  type Marchandise,
} from "./marchandise";
import { MarchandiseApi } from "./marchandise-api";

@Component({
  imports: [FicheHeader, StatutChip, ...FORM_PAGE_IMPORTS],
  selector: "app-marchandise-detail-page",
  templateUrl: "./marchandise-detail-page.html",
})
export class MarchandiseDetailPage {
  private readonly api = inject(MarchandiseApi);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly actifLabel = actifLabel;
  protected readonly actifTone = actifTone;
  protected readonly gerbableLabel = gerbableLabel;
  protected readonly deactivateError = signal<string | null>(null);

  protected readonly marchandise = httpResource<Marchandise>(() => ({
    url: `${environment.apiBaseUrl}/marchandises/${this.id()}`,
  }));

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.marchandise.error())
  );

  protected async desactiver(): Promise<void> {
    this.deactivateError.set(null);
    try {
      await this.api.desactiver(this.id());
      this.marchandise.reload();
      this.toast.success("Marchandise désactivée.");
    } catch (error) {
      this.deactivateError.set(httpErrorMessage(error));
    }
  }
}
