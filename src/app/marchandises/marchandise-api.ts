import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Marchandise, MarchandiseWrite } from "./marchandise";

/**
 * Marchandise HTTP surface: POST create, GET list/detail, DELETE deactivate.
 * List/detail are usually loaded via httpResource on pages; create is used
 * inline when the catalogue has no matching entry yet.
 */
@Service()
export class MarchandiseApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/marchandises`;

  create(body: MarchandiseWrite): Promise<Marchandise> {
    return firstValueFrom(this.http.post<Marchandise>(this.baseUrl, body));
  }

  desactiver(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
