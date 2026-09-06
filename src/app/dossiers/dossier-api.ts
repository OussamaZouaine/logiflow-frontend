import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Dossier, DossierWrite, StatutDossier } from "./dossier";

/**
 * Dossier HTTP surface: POST create, GET list/detail, PUT statut.
 * No update payload — lifecycle only via statut after creation.
 */
@Service()
export class DossierApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/dossiers`;

  create(body: DossierWrite): Promise<Dossier> {
    return firstValueFrom(this.http.post<Dossier>(this.baseUrl, body));
  }

  changerStatut(id: string, valeur: StatutDossier): Promise<Dossier> {
    return firstValueFrom(
      this.http.put<Dossier>(`${this.baseUrl}/${id}/statut`, null, {
        params: { valeur },
      })
    );
  }
}
