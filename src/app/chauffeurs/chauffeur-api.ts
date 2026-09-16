import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Chauffeur } from "./chauffeur";

/**
 * Chauffeur HTTP surface: GET list/detail, POST create, PUT update.
 * List/detail are usually loaded via httpResource on pages.
 */
@Service()
export class ChauffeurApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/chauffeurs`;

  get(id: string): Promise<Chauffeur> {
    return firstValueFrom(this.http.get<Chauffeur>(`${this.baseUrl}/${id}`));
  }
}
