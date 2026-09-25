import { httpResource } from "@angular/common/http";
import { Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { StatutChip } from "../shared/ui/statut-chip";
import {
  formatDate,
  formatDateHeure,
  formatEcheance,
  formatKm,
  formatMontant,
  formatPeriodicite,
  libelle,
  type OrdreTravail,
  type PlanEntretien,
  toneEcheance,
  toneStatutOT,
} from "./maintenance";
import { creerLookupsMaintenance } from "./maintenance-lookups";
import { MaintenanceTabs } from "./maintenance-tabs";

/** Fiche d'un plan d'entretien : échéance, paramètres, historique des OT et planification. */
@Component({
  imports: [RouterLink, StatutChip, MaintenanceTabs, ...FICHE_PAGE_IMPORTS],
  selector: "app-plan-detail-page",
  templateUrl: "./plan-detail-page.html",
})
export class PlanDetailPage {
  readonly id = input.required<string>();

  protected readonly lookups = creerLookupsMaintenance();
  protected readonly libelle = libelle;
  protected readonly formatDate = formatDate;
  protected readonly formatDateHeure = formatDateHeure;
  protected readonly formatEcheance = formatEcheance;
  protected readonly formatMontant = formatMontant;
  protected readonly formatKm = formatKm;
  protected readonly formatPeriodicite = formatPeriodicite;
  protected readonly toneEcheance = toneEcheance;
  protected readonly toneStatutOT = toneStatutOT;

  protected readonly plan = httpResource<PlanEntretien>(() => ({
    url: `${environment.apiBaseUrl}/maintenance/plans/${this.id()}`,
  }));
  protected readonly historique = httpResource<OrdreTravail[]>(() => ({
    url: `${environment.apiBaseUrl}/maintenance/plans/${this.id()}/ordres-travail`,
  }));

  protected readonly otOuvert = computed(() =>
    (this.historique.value() ?? []).find(
      (o) => o.statut !== "TERMINE" && o.statut !== "ANNULE"
    )
  );

  /** Paramètres du formulaire d'OT pré-rempli depuis le plan. */
  protected readonly planifier = computed(() => {
    const p = this.plan.value();
    if (!p) {
      return null;
    }
    const echeance = p.echeance?.dateEcheance;
    return {
      debut:
        echeance && echeance > new Date().toISOString().slice(0, 10)
          ? `${echeance}T08:00:00`
          : null,
      enginId: p.engin.id,
      origine: "PLAN_ENTRETIEN",
      planId: p.id,
      prestataireId: p.prestataireId,
      titre: p.libelle,
      type: p.type,
      typeEngin: p.engin.type,
    };
  });

  protected readonly lienEngin = computed(() => {
    const p = this.plan.value();
    return p
      ? [p.engin.type === "VEHICULE" ? "/vehicules" : "/remorques", p.engin.id]
      : null;
  });
}
