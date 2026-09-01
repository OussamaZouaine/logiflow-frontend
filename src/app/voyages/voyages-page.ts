import { httpResource } from "@angular/common/http";
import { Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { DemoSessionService } from "../core/auth/demo-session";
import { VOYAGES_PLAN_ROLES } from "../core/auth/role";
import {
  formatInstant,
  porteeLabel,
  statutVoyageLabel,
  typeVoyageLabel,
  type Voyage,
} from "./voyage";

const VOYAGES_PAGE_SIZE = 20;

@Component({
  imports: [RouterLink],
  selector: "app-voyages-page",
  templateUrl: "./voyages-page.html",
})
export class VoyagesPage {
  private readonly session = inject(DemoSessionService);

  protected readonly formatInstant = formatInstant;
  protected readonly porteeLabel = porteeLabel;
  protected readonly statutVoyageLabel = statutVoyageLabel;
  protected readonly typeVoyageLabel = typeVoyageLabel;

  protected readonly canPlan = computed(() =>
    this.session.hasAnyRole(VOYAGES_PLAN_ROLES)
  );

  protected readonly voyages = httpResource<PageResponse<Voyage>>(() => ({
    params: {
      page: 0,
      size: VOYAGES_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/voyages`,
  }));

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.voyages.error())
  );
}
