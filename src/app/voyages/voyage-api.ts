import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type {
  EvenementVoyage,
  StatutVoyage,
  TypeEvenement,
  Voyage,
  VoyageWrite,
} from "./voyage";

/**
 * Voyage HTTP surface: POST create, GET list/detail, PUT statut.
 * No DELETE — cancel via statut ANNULE.
 *
 * Backend next: VoyageRepositoryAdapter still save()s a new JPA row (version 0).
 * A second statut change 500s (optimistic lock) until it updates in place
 * like VehiculeRepositoryAdapter.
 */
@Service()
export class VoyageApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/voyages`;

  create(body: VoyageWrite): Promise<Voyage> {
    return firstValueFrom(this.http.post<Voyage>(this.baseUrl, body));
  }

  changerStatut(id: string, valeur: StatutVoyage): Promise<Voyage> {
    return firstValueFrom(
      this.http.put<Voyage>(`${this.baseUrl}/${id}/statut`, null, {
        params: { valeur },
      })
    );
  }

  declarerEvenement(body: {
    commentaire: string | null;
    horodatage: string;
    type: TypeEvenement;
    voyageId: string;
  }): Promise<EvenementVoyage> {
    return firstValueFrom(
      this.http.post<EvenementVoyage>(
        `${environment.apiBaseUrl}/evenements-voyage`,
        body
      )
    );
  }
}
