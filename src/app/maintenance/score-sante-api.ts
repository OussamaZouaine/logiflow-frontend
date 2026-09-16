import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type { ScoreSante, ScoreSanteWrite } from "./score-sante";

/** Score santé HTTP surface — calcul (POST) and dernier par véhicule. */
@Service()
export class ScoreSanteApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/scores-sante`;

  calculer(body: ScoreSanteWrite): Promise<ScoreSante> {
    return firstValueFrom(this.http.post<ScoreSante>(this.baseUrl, body));
  }

  dernier(vehiculeId: string): Promise<ScoreSante | null> {
    return firstValueFrom(
      this.http.get<ScoreSante | null>(`${this.baseUrl}/dernier`, {
        params: { vehiculeId },
      })
    );
  }
}
