import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Vehicule, VehiculeWrite } from "./vehicule";

/**
 * Véhicule HTTP surface (no DELETE, no general PUT of plate/type/weights).
 * Updates are documents + counters only. Identity is set at create.
 */
@Service()
export class VehiculeApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/vehicules`;

  create(body: VehiculeWrite): Promise<Vehicule> {
    return firstValueFrom(this.http.post<Vehicule>(this.baseUrl, body));
  }

  updateDocuments(id: string, body: VehiculeWrite): Promise<Vehicule> {
    return firstValueFrom(
      this.http.put<Vehicule>(`${this.baseUrl}/${id}/documents`, body)
    );
  }

  relever(
    id: string,
    kilometrage: number,
    heuresMoteur: number
  ): Promise<Vehicule> {
    return firstValueFrom(
      this.http.put<Vehicule>(`${this.baseUrl}/${id}/compteurs`, null, {
        params: { heuresMoteur, kilometrage },
      })
    );
  }
}
