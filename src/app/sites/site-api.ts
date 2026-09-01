import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Site, SiteWrite } from "./site";

/**
 * Site HTTP surface: POST create, GET, PUT update, DELETE deactivate.
 *
 * Backend next: SiteRepositoryAdapter still save()s a new JPA row (version 0).
 * A second PUT or a DELETE after any save 500s (optimistic lock) until it
 * updates in place like VehiculeRepositoryAdapter.
 */
@Service()
export class SiteApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/sites`;

  create(body: SiteWrite): Promise<Site> {
    return firstValueFrom(this.http.post<Site>(this.baseUrl, body));
  }

  update(id: string, body: SiteWrite): Promise<Site> {
    return firstValueFrom(this.http.put<Site>(`${this.baseUrl}/${id}`, body));
  }

  desactiver(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
