import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { GroupageAnalyseRequest, PropositionGroupage } from "./groupage";

/**
 * Façade IA groupage — POST /api/v1/ia/groupage/propositions.
 * Returns deterministic fallback when the Flask service is unavailable.
 */
@Service()
export class GroupageApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ia/groupage/propositions`;

  propositions(
    request: GroupageAnalyseRequest
  ): Promise<readonly PropositionGroupage[]> {
    return firstValueFrom(
      this.http.post<readonly PropositionGroupage[]>(this.baseUrl, request)
    );
  }
}
