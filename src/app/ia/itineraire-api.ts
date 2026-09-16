import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { ItineraireCalcule, ItinerairePoint } from "./itineraire";

/**
 * Façade IA itinéraire — POST /api/v1/ia/itineraires/calcul (OSRM via Spring Boot).
 * Returns 503 when the AI service is unavailable; no client-side fallback.
 */
@Service()
export class ItineraireApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ia/itineraires/calcul`;

  calculer(points: readonly ItinerairePoint[]): Promise<ItineraireCalcule> {
    return firstValueFrom(
      this.http.post<ItineraireCalcule>(this.baseUrl, { points })
    );
  }
}
