import { httpResource } from "@angular/common/http";
import { Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { DemoSessionService } from "../core/auth/demo-session";
import { DOSSIERS_PLAN_ROLES } from "../core/auth/role";
import {
  statutDossierLabel,
  type Dossier,
  typeTransportLabel,
} from "./dossier";

const DOSSIERS_PAGE_SIZE = 20;

@Component({
  imports: [RouterLink],
  selector: "app-dossiers-page",
  templateUrl: "./dossiers-page.html",
})
export class DossiersPage {
  private readonly session = inject(DemoSessionService);

  protected readonly statutDossierLabel = statutDossierLabel;
  protected readonly typeTransportLabel = typeTransportLabel;

  protected readonly canPlan = computed(() =>
    this.session.hasAnyRole(DOSSIERS_PLAN_ROLES)
  );

  protected readonly dossiers = httpResource<PageResponse<Dossier>>(() => ({
    params: {
      page: 0,
      size: DOSSIERS_PAGE_SIZE,
    },
    url: `${environment.apiBaseUrl}/dossiers`,
  }));

  protected readonly errorMessage = computed(() =>
    httpErrorMessage(this.dossiers.error())
  );
}
