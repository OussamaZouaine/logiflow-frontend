import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type {
  OrdreTravail,
  OrdreTravailWrite,
  StatutOT,
} from "./ordre-travail";

/**
 * Ordre de travail HTTP surface: POST create, GET list, GET by id, PUT statut.
 * No DELETE — cancel via statut ANNULE.
 * Second statut change 500s until OrdreTravailRepositoryAdapter updates
 * in place like VehiculeRepositoryAdapter.
 */
@Service()
export class OrdreTravailApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ordres-travail`;

  create(body: OrdreTravailWrite): Promise<OrdreTravail> {
    return firstValueFrom(this.http.post<OrdreTravail>(this.baseUrl, body));
  }

  changerStatut(id: string, valeur: StatutOT): Promise<OrdreTravail> {
    return firstValueFrom(
      this.http.put<OrdreTravail>(`${this.baseUrl}/${id}/statut`, null, {
        params: { valeur },
      })
    );
  }
}
