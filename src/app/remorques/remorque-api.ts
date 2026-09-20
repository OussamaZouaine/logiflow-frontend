import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { Remorque, RemorqueWrite } from "./remorque";

/** Remorque HTTP surface — list, create, compteurs (no DELETE). */
@Service()
export class RemorqueApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/remorques`;

  create(body: RemorqueWrite): Promise<Remorque> {
    return firstValueFrom(this.http.post<Remorque>(this.baseUrl, body));
  }

  relever(
    id: string,
    kilometrage: number,
    heuresGroupeFroid: number
  ): Promise<Remorque> {
    return firstValueFrom(
      this.http.put<Remorque>(`${this.baseUrl}/${id}/compteurs`, null, {
        params: { heuresGroupeFroid, kilometrage },
      })
    );
  }

  sortir(
    id: string,
    dateSortie: string,
    options?: {
      heuresGroupeFroidSortie?: number;
      kilometrageSortie?: number;
      motifSortie?: string;
    }
  ): Promise<Remorque> {
    const params: Record<string, string | number> = { dateSortie };
    if (options?.motifSortie) {
      params["motifSortie"] = options.motifSortie;
    }
    if (options?.kilometrageSortie != null) {
      params["kilometrageSortie"] = options.kilometrageSortie;
    }
    if (options?.heuresGroupeFroidSortie != null) {
      params["heuresGroupeFroidSortie"] = options.heuresGroupeFroidSortie;
    }
    return firstValueFrom(
      this.http.put<Remorque>(`${this.baseUrl}/${id}/sortie`, null, {
        params,
      })
    );
  }
}
