import { httpResource } from "@angular/common/http";
import { Component, computed } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import {
  type Commande,
  formatDate,
  formatMoney,
  statutCommandeLabel,
} from "./commande";

const COMMANDES_PAGE_SIZE = 20;

@Component({
  imports: [RouterLink],
  selector: "app-commandes-page",
  templateUrl: "./commandes-page.html",
})
export class CommandesPage {
  protected readonly formatDate = formatDate;
  protected readonly formatMoney = formatMoney;
  protected readonly statutCommandeLabel = statutCommandeLabel;

  protected readonly commandes = httpResource<PageResponse<Commande>>(() => ({
    params: {
      page: 0,
      size: COMMANDES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/commandes`,
  }));

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.commandes.error())
  );
}
