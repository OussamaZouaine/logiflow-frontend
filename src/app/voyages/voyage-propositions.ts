import { Component, computed, input, output } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCircleAlert,
  lucideClock,
  lucideMapPin,
  lucideSparkles,
  lucideTriangleAlert,
  lucideTruck,
  lucideUsers,
} from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import {
  formatHeure,
  formatMontantArrondi,
  formatPourcentage,
  libelle,
  meilleuresValeurs,
  natureArret,
  type OptionVoyage,
  type PropositionsVoyage,
  sourceLabel,
  tauxRemplissage,
} from "../ia/planification";
import { StatutChip } from "../shared/ui/statut-chip";
import { type ArretCarte, ItineraireCarte } from "./itineraire-carte";
import { formatDureeMin } from "./voyage";

/**
 * Comparaison des voyages proposés par l'agent de planification : tableau comparatif, puis une
 * fiche par option (carte, frise des heures d'arrivée, ressources, conformité). « Choisir »
 * remonte l'option à la page, qui pré-remplit le formulaire pour relecture.
 */
@Component({
  imports: [NgIcon, StatutChip, ItineraireCarte, ZardButtonComponent],
  selector: "app-voyage-propositions",
  templateUrl: "./voyage-propositions.html",
  viewProviders: [
    provideIcons({
      lucideCircleAlert,
      lucideClock,
      lucideMapPin,
      lucideSparkles,
      lucideTriangleAlert,
      lucideTruck,
      lucideUsers,
    }),
  ],
})
export class VoyagePropositions {
  readonly propositions = input.required<PropositionsVoyage>();
  readonly choisir = output<OptionVoyage>();

  protected readonly formatDureeMin = formatDureeMin;
  protected readonly formatMontantArrondi = formatMontantArrondi;
  protected readonly formatHeure = formatHeure;
  protected readonly formatPourcentage = formatPourcentage;
  protected readonly libelle = libelle;
  protected readonly natureArret = natureArret;
  protected readonly tauxRemplissage = tauxRemplissage;

  protected readonly options = computed(() => this.propositions().options);
  protected readonly meilleures = computed(() =>
    this.options().length > 0 ? meilleuresValeurs(this.options()) : null
  );
  protected readonly source = computed(() => sourceLabel(this.propositions()));

  protected arretsCarte(option: OptionVoyage): readonly ArretCarte[] {
    return option.arrets.map((arret) => ({
      id: `${option.rang}-${arret.ordre}`,
      latitude: arret.latitude,
      libelle: arret.libelle,
      longitude: arret.longitude,
    }));
  }

  protected dossiers(ids: readonly string[]): string {
    const table = this.propositions().libelles.dossiers;
    return ids.map((id) => libelle(table, id)).join(", ");
  }

  protected chauffeurs(option: OptionVoyage): string {
    const table = this.propositions().libelles.chauffeurs;
    return option.chauffeurIds
      .map(
        (id, index) => `${libelle(table, id)}${index > 0 ? " (renfort)" : ""}`
      )
      .join(" · ");
  }

  protected vehicule(option: OptionVoyage): string {
    const { vehicules, remorques } = this.propositions().libelles;
    const tracteur = libelle(vehicules, option.vehiculeId);
    return option.remorqueId
      ? `${tracteur} + ${libelle(remorques, option.remorqueId)}`
      : tracteur;
  }
}
