import { httpResource } from "@angular/common/http";
import { Component, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { statutLabel, typeLabel, type Vehicule } from "./vehicule";

const VEHICULES_PAGE_SIZE = 20;

@Component({
  imports: [RouterLink],
  selector: "app-vehicules-page",
  templateUrl: "./vehicules-page.html",
})
export class VehiculesPage {
  protected readonly typeLabel = typeLabel;
  protected readonly statutLabel = statutLabel;

  protected readonly searchDraft = signal("");
  protected readonly search = signal("");

  protected readonly vehicules = httpResource<PageResponse<Vehicule>>(() => ({
    params: {
      page: 0,
      q: this.search().trim(),
      size: VEHICULES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/vehicules`,
  }));

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.vehicules.error())
  );

  protected onSearchInput(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.searchDraft.set(target.value);
    }
  }

  protected applySearch(event: SubmitEvent): void {
    event.preventDefault();
    this.search.set(this.searchDraft().trim());
  }
}
