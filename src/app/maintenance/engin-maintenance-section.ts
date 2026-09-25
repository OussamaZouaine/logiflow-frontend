import { httpResource } from "@angular/common/http";
import { Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import type { PageResponse } from "../core/api/page-response";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  formatDate,
  formatDateHeure,
  formatEcheance,
  formatEur,
  formatPeriodicite,
  libelle,
  type OrdreTravail,
  type PlanEntretien,
  type Sinistre,
  type TypeEngin,
  toneEcheance,
  toneStatutOT,
  toneStatutSinistre,
} from "./maintenance";

/** Section « Maintenance » d'une fiche véhicule ou remorque : plans, derniers OT, sinistres. */
@Component({
  imports: [RouterLink, StatutChip, ...FICHE_PAGE_IMPORTS],
  selector: "app-engin-maintenance-section",
  templateUrl: "./engin-maintenance-section.html",
})
export class EnginMaintenanceSection {
  readonly typeEngin = input.required<TypeEngin>();
  readonly enginId = input.required<string>();

  protected readonly libelle = libelle;
  protected readonly formatDate = formatDate;
  protected readonly formatDateHeure = formatDateHeure;
  protected readonly formatEcheance = formatEcheance;
  protected readonly formatEur = formatEur;
  protected readonly formatPeriodicite = formatPeriodicite;
  protected readonly toneEcheance = toneEcheance;
  protected readonly toneStatutOT = toneStatutOT;
  protected readonly toneStatutSinistre = toneStatutSinistre;

  private readonly api = `${environment.apiBaseUrl}/maintenance`;

  protected readonly plans = httpResource<PageResponse<PlanEntretien>>(() => ({
    params: {
      enginId: this.enginId(),
      page: 0,
      size: 10,
      typeEngin: this.typeEngin(),
    },
    url: `${this.api}/plans`,
  }));
  protected readonly ordres = httpResource<PageResponse<OrdreTravail>>(() => ({
    params: { enginId: this.enginId(), page: 0, size: 5 },
    url: `${this.api}/ordres-travail`,
  }));
  protected readonly sinistres = httpResource<PageResponse<Sinistre>>(() => ({
    params: { enginId: this.enginId(), page: 0, size: 5 },
    url: `${this.api}/sinistres`,
  }));

  /** Paramètres de pré-remplissage des formulaires (OT, plan, sinistre). */
  protected readonly prefill = computed(() => ({
    enginId: this.enginId(),
    typeEngin: this.typeEngin(),
  }));
  protected readonly prefillSinistre = computed(() =>
    this.typeEngin() === "VEHICULE"
      ? { vehiculeId: this.enginId() }
      : { remorqueId: this.enginId() }
  );
}
