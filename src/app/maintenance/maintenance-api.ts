import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import type {
  ContratAssurance,
  DetailsOT,
  EnginRef,
  LigneCout,
  OrdreTravail,
  Origine,
  PlanEntretien,
  Prestataire,
  Sinistre,
  StatutOT,
  StatutSinistre,
} from "./maintenance";

export const MAINTENANCE_API = `${environment.apiBaseUrl}/maintenance`;

export interface CreerOrdreTravail {
  details: DetailsOT;
  engin: EnginRef;
  lignes: LigneCout[];
  origine: Origine;
  planId: string | null;
  sinistreId: string | null;
}

export interface ClotureOT {
  dateFacture: string | null;
  diagnostic: string | null;
  finReelle: string;
  heures: number | null;
  intervenant: string | null;
  kilometrage: number | null;
  numeroFacture: string | null;
  travauxRealises: string | null;
}

export type ParametresPlan = Omit<
  PlanEntretien,
  "derniereDate" | "derniereHeures" | "derniereKm" | "echeance" | "engin" | "id"
>;

export interface CreerPlan {
  derniereDate: string | null;
  derniereHeures: number | null;
  derniereKm: number | null;
  engin: EnginRef;
  parametres: ParametresPlan;
}

export type SinistreWrite = Omit<
  Sinistre,
  | "couts"
  | "dateCloture"
  | "declarationEnRetard"
  | "id"
  | "reference"
  | "statut"
>;

export type PrestataireWrite = Omit<Prestataire, "id">;

export type ContratWrite = Omit<ContratAssurance, "enVigueur" | "id">;

/** Écritures du module maintenance (les lectures passent par httpResource dans les pages). */
@Service()
export class MaintenanceApi {
  private readonly http = inject(HttpClient);

  // Lectures unitaires (chargement des formulaires en modification)
  consulterOrdre(id: string): Promise<OrdreTravail> {
    return firstValueFrom(
      this.http.get<OrdreTravail>(`${MAINTENANCE_API}/ordres-travail/${id}`)
    );
  }

  consulterPlan(id: string): Promise<PlanEntretien> {
    return firstValueFrom(
      this.http.get<PlanEntretien>(`${MAINTENANCE_API}/plans/${id}`)
    );
  }

  consulterSinistre(id: string): Promise<Sinistre> {
    return firstValueFrom(
      this.http.get<Sinistre>(`${MAINTENANCE_API}/sinistres/${id}`)
    );
  }

  consulterPrestataire(id: string): Promise<Prestataire> {
    return firstValueFrom(
      this.http.get<Prestataire>(`${MAINTENANCE_API}/prestataires/${id}`)
    );
  }

  consulterContrat(id: string): Promise<ContratAssurance> {
    return firstValueFrom(
      this.http.get<ContratAssurance>(
        `${MAINTENANCE_API}/contrats-assurance/${id}`
      )
    );
  }

  // Ordres de travail
  creerOrdre(body: CreerOrdreTravail): Promise<OrdreTravail> {
    return firstValueFrom(
      this.http.post<OrdreTravail>(`${MAINTENANCE_API}/ordres-travail`, body)
    );
  }

  modifierOrdre(id: string, details: DetailsOT): Promise<OrdreTravail> {
    return firstValueFrom(
      this.http.put<OrdreTravail>(
        `${MAINTENANCE_API}/ordres-travail/${id}`,
        details
      )
    );
  }

  remplacerLignes(id: string, lignes: LigneCout[]): Promise<OrdreTravail> {
    return firstValueFrom(
      this.http.put<OrdreTravail>(
        `${MAINTENANCE_API}/ordres-travail/${id}/lignes`,
        lignes
      )
    );
  }

  changerStatutOrdre(id: string, valeur: StatutOT): Promise<OrdreTravail> {
    return firstValueFrom(
      this.http.patch<OrdreTravail>(
        `${MAINTENANCE_API}/ordres-travail/${id}/statut`,
        { valeur }
      )
    );
  }

  cloturerOrdre(id: string, body: ClotureOT): Promise<OrdreTravail> {
    return firstValueFrom(
      this.http.post<OrdreTravail>(
        `${MAINTENANCE_API}/ordres-travail/${id}/cloture`,
        body
      )
    );
  }

  // Plans d'entretien
  creerPlan(body: CreerPlan): Promise<PlanEntretien> {
    return firstValueFrom(
      this.http.post<PlanEntretien>(`${MAINTENANCE_API}/plans`, body)
    );
  }

  modifierPlan(id: string, parametres: ParametresPlan): Promise<PlanEntretien> {
    return firstValueFrom(
      this.http.put<PlanEntretien>(`${MAINTENANCE_API}/plans/${id}`, parametres)
    );
  }

  // Sinistres
  declarerSinistre(body: SinistreWrite): Promise<Sinistre> {
    return firstValueFrom(
      this.http.post<Sinistre>(`${MAINTENANCE_API}/sinistres`, body)
    );
  }

  modifierSinistre(id: string, body: SinistreWrite): Promise<Sinistre> {
    return firstValueFrom(
      this.http.put<Sinistre>(`${MAINTENANCE_API}/sinistres/${id}`, body)
    );
  }

  changerStatutSinistre(id: string, valeur: StatutSinistre): Promise<Sinistre> {
    return firstValueFrom(
      this.http.patch<Sinistre>(`${MAINTENANCE_API}/sinistres/${id}/statut`, {
        valeur,
      })
    );
  }

  creerReparation(
    sinistreId: string,
    engin: EnginRef,
    details: DetailsOT
  ): Promise<OrdreTravail> {
    return firstValueFrom(
      this.http.post<OrdreTravail>(
        `${MAINTENANCE_API}/sinistres/${sinistreId}/reparations`,
        {
          details,
          engin,
        }
      )
    );
  }

  // Prestataires et contrats
  creerPrestataire(body: PrestataireWrite): Promise<Prestataire> {
    return firstValueFrom(
      this.http.post<Prestataire>(`${MAINTENANCE_API}/prestataires`, body)
    );
  }

  modifierPrestataire(
    id: string,
    body: PrestataireWrite
  ): Promise<Prestataire> {
    return firstValueFrom(
      this.http.put<Prestataire>(`${MAINTENANCE_API}/prestataires/${id}`, body)
    );
  }

  creerContrat(body: ContratWrite): Promise<ContratAssurance> {
    return firstValueFrom(
      this.http.post<ContratAssurance>(
        `${MAINTENANCE_API}/contrats-assurance`,
        body
      )
    );
  }

  modifierContrat(id: string, body: ContratWrite): Promise<ContratAssurance> {
    return firstValueFrom(
      this.http.put<ContratAssurance>(
        `${MAINTENANCE_API}/contrats-assurance/${id}`,
        body
      )
    );
  }
}
