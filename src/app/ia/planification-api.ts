import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { PlanificationRequest, PropositionsVoyage } from "./planification";

/**
 * Agent de planification de voyage — POST /api/v1/ia/planification/propositions.
 * Chaque option est revalidée par les règles de création côté Spring ; 503 si le service IA
 * est indisponible (l'écran bascule alors sur la planification manuelle).
 */
@Service()
export class PlanificationApi {
  private readonly http = inject(HttpClient);
  private readonly url =
    `${environment.apiBaseUrl}/ia/planification/propositions`;

  proposer(body: PlanificationRequest): Promise<PropositionsVoyage> {
    return firstValueFrom(this.http.post<PropositionsVoyage>(this.url, body));
  }
}
