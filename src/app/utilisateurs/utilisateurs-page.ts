import { httpResource } from "@angular/common/http";
import { Component, computed, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { formatRoles, type Utilisateur } from "./utilisateur";

const UTILISATEURS_PAGE_SIZE = 20;

@Component({
  imports: [RouterLink],
  selector: "app-utilisateurs-page",
  templateUrl: "./utilisateurs-page.html",
})
export class UtilisateursPage {
  protected readonly formatRoles = formatRoles;
  protected readonly searchDraft = signal("");
  protected readonly search = signal("");

  protected readonly utilisateurs = httpResource<PageResponse<Utilisateur>>(
    () => ({
      params: {
        page: 0,
        q: this.search().trim(),
        size: UTILISATEURS_PAGE_SIZE,
      },
      url: `${environment.apiBaseUrl}/utilisateurs`,
    })
  );

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.utilisateurs.error())
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
