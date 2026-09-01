import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Utilisateur, UtilisateurWrite } from "./utilisateur";

/**
 * Utilisateur HTTP surface: POST create, GET list/detail, PUT email+roles,
 * DELETE deactivate. Login is required on PUT by the DTO but ignored by
 * MajUtilisateurCommand. No reactivate endpoint (domain has activer()).
 *
 * Backend next: UtilisateurRepositoryAdapter still save()s a new JPA row
 * (version 0). A second PUT or DELETE after any save 500s until it updates
 * in place like VehiculeRepositoryAdapter.
 */
@Service()
export class UtilisateurApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/utilisateurs`;

  create(body: UtilisateurWrite): Promise<Utilisateur> {
    return firstValueFrom(this.http.post<Utilisateur>(this.baseUrl, body));
  }

  update(id: string, body: UtilisateurWrite): Promise<Utilisateur> {
    return firstValueFrom(
      this.http.put<Utilisateur>(`${this.baseUrl}/${id}`, body)
    );
  }

  desactiver(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
