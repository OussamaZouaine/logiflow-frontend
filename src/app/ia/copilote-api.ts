import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { CopiloteRequest, CopiloteResponse } from "./copilote";

/**
 * Façade IA copilote — POST /api/v1/ia/copilote/questions.
 * Returns 503 when the Flask service is unavailable; no client-side fallback.
 */
@Service()
export class CopiloteApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ia/copilote/questions`;

  poserQuestion(request: CopiloteRequest): Promise<CopiloteResponse> {
    return firstValueFrom(
      this.http.post<CopiloteResponse>(this.baseUrl, request)
    );
  }
}
