import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { PlanEntretien, PlanEntretienWrite } from "./plan-entretien";

/** Plan d'entretien HTTP surface — create only (no DELETE). */
@Service()
export class PlanEntretienApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/plans-entretien`;

  create(body: PlanEntretienWrite): Promise<PlanEntretien> {
    return firstValueFrom(this.http.post<PlanEntretien>(this.baseUrl, body));
  }
}
