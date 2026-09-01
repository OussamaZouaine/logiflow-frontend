import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Client, Commande, CommandeWrite } from "./commande";

/**
 * Commande HTTP surface: POST create, GET list/detail, PUT confirmer, PUT annuler.
 * No DELETE — cancel via PUT .../annuler.
 *
 * Backend next: CommandeRepositoryAdapter still save()s a new JPA row (version 0).
 * A second confirmer/annuler 500s (optimistic lock) until it updates in place
 * like VehiculeRepositoryAdapter.
 *
 * Clients have no list endpoint — create a client first, or paste an existing id.
 */
@Service()
export class CommandeApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/commandes`;

  createClient(body: { code: string; raisonSociale: string }): Promise<Client> {
    return firstValueFrom(
      this.http.post<Client>(`${environment.apiBaseUrl}/clients`, body)
    );
  }

  create(body: CommandeWrite): Promise<Commande> {
    return firstValueFrom(this.http.post<Commande>(this.baseUrl, body));
  }

  confirmer(id: string): Promise<Commande> {
    return firstValueFrom(
      this.http.put<Commande>(`${this.baseUrl}/${id}/confirmer`, null)
    );
  }

  annuler(id: string): Promise<Commande> {
    return firstValueFrom(
      this.http.put<Commande>(`${this.baseUrl}/${id}/annuler`, null)
    );
  }
}
