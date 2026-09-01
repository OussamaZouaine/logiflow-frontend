import { HttpErrorResponse, httpResource } from "@angular/common/http";
import { Component, computed } from "@angular/core";
import { environment } from "../../environments/environment";
import type { PageResponse } from "../core/api/page-response";
import type { Site } from "./site";

const SITES_PAGE_SIZE = 20;

@Component({
  selector: "app-sites-page",
  templateUrl: "./sites-page.html",
})
export class SitesPage {
  protected readonly sites = httpResource<PageResponse<Site>>(() => ({
    params: {
      page: 0,
      size: SITES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/sites`,
  }));

  protected readonly errorMessage = computed(() => {
    const error = this.sites.error();
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return "Backend injoignable. Démarre logiflow-backend (`make run`) puis recharge.";
      }
      return `Erreur ${error.status} : ${error.statusText}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Chargement impossible.";
  });
}
