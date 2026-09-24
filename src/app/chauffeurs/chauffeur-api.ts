import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type {
  Chauffeur,
  ChauffeurCreateWrite,
  ChauffeurDisponibilite,
  ChauffeurStatut,
  ChauffeurUpdateWrite,
} from "./chauffeur";

/**
 * Chauffeur HTTP surface: GET detail, POST create, PUT update (profil complet),
 * PATCH statut / disponibilité. List/detail are usually loaded via httpResource.
 */
@Service()
export class ChauffeurApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/chauffeurs`;

  get(id: string): Promise<Chauffeur> {
    return firstValueFrom(this.http.get<Chauffeur>(`${this.baseUrl}/${id}`));
  }

  create(body: ChauffeurCreateWrite): Promise<Chauffeur> {
    return firstValueFrom(this.http.post<Chauffeur>(this.baseUrl, body));
  }

  update(id: string, body: ChauffeurUpdateWrite): Promise<Chauffeur> {
    return firstValueFrom(
      this.http.put<Chauffeur>(`${this.baseUrl}/${id}`, body)
    );
  }

  changerStatut(id: string, valeur: ChauffeurStatut): Promise<Chauffeur> {
    return firstValueFrom(
      this.http.patch<Chauffeur>(`${this.baseUrl}/${id}/statut`, { valeur })
    );
  }

  changerDisponibilite(
    id: string,
    valeur: ChauffeurDisponibilite
  ): Promise<Chauffeur> {
    return firstValueFrom(
      this.http.patch<Chauffeur>(`${this.baseUrl}/${id}/disponibilite`, {
        valeur,
      })
    );
  }
}
