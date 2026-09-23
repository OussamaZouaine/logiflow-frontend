import { httpResource } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { RemorqueCapacityDisplay } from "./remorque-capacity-display";
import type { VoyageCapacite } from "./voyage-capacite";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RemorqueCapacityDisplay],
  selector: "app-remorque-capacity-view",
  templateUrl: "./remorque-capacity-view.html",
})
export class RemorqueCapacityView {
  readonly voyageId = input.required<string>();

  protected readonly capacite = httpResource<VoyageCapacite>(() => ({
    url: `${environment.apiBaseUrl}/voyages/${this.voyageId()}/capacite`,
  }));

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.capacite.error())
  );

  reload(): void {
    this.capacite.reload();
  }
}
