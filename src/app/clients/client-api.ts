import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Client, ClientWrite } from "./client";

/** Client HTTP surface: POST create, GET list/detail, DELETE deactivate. */
@Service()
export class ClientApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/clients`;

  create(body: ClientWrite): Promise<Client> {
    return firstValueFrom(this.http.post<Client>(this.baseUrl, body));
  }

  desactiver(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
