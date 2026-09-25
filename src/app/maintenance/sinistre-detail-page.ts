import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { DocumentsSection } from "../shared/ui/documents-section";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { StatutChip } from "../shared/ui/statut-chip";
import { ToastService } from "../shared/ui/toast";
import {
  type ContratAssurance,
  formatDate,
  formatDateHeure,
  formatEur,
  libelle,
  type OrdreTravail,
  type Sinistre,
  type StatutSinistre,
  type TypeEngin,
  toneStatutOT,
  toneStatutSinistre,
  transitionsSinistre,
} from "./maintenance";
import { MaintenanceApi } from "./maintenance-api";
import { creerLookupsMaintenance } from "./maintenance-lookups";
import { MaintenanceTabs } from "./maintenance-tabs";

const LIBELLES_TRANSITION: Partial<Record<StatutSinistre, string>> = {
  CLASSE_SANS_SUITE: "Classer sans suite",
  CLOS: "Clore le dossier",
  DECLARE_ASSUREUR: "Déclaré à l'assureur",
  EN_EXPERTISE: "Expertise en cours",
  EN_REPARATION: "Passer en réparation",
};

/** Fiche d'un sinistre : workflow assurance, coût net, réparations liées et pièces. */
@Component({
  imports: [
    RouterLink,
    StatutChip,
    DocumentsSection,
    MaintenanceTabs,
    ...FICHE_PAGE_IMPORTS,
  ],
  selector: "app-sinistre-detail-page",
  templateUrl: "./sinistre-detail-page.html",
})
export class SinistreDetailPage {
  private readonly api = inject(MaintenanceApi);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly lookups = creerLookupsMaintenance();
  protected readonly libelle = libelle;
  protected readonly formatDate = formatDate;
  protected readonly formatDateHeure = formatDateHeure;
  protected readonly formatEur = formatEur;
  protected readonly toneStatutSinistre = toneStatutSinistre;
  protected readonly toneStatutOT = toneStatutOT;

  protected readonly sinistre = httpResource<Sinistre>(() => ({
    url: `${environment.apiBaseUrl}/maintenance/sinistres/${this.id()}`,
  }));
  protected readonly reparations = httpResource<OrdreTravail[]>(() => ({
    url: `${environment.apiBaseUrl}/maintenance/sinistres/${this.id()}/ordres-travail`,
  }));
  protected readonly contrat = httpResource<ContratAssurance>(() => {
    const contratId = this.sinistre.value()?.contratId;
    return contratId
      ? {
          url: `${environment.apiBaseUrl}/maintenance/contrats-assurance/${contratId}`,
        }
      : undefined;
  });

  protected readonly actionError = signal<string | null>(null);
  protected readonly enCours = signal(false);

  protected readonly transitions = computed(() => {
    const s = this.sinistre.value();
    return s ? transitionsSinistre(s.statut) : [];
  });
  protected readonly ouvert = computed(() => {
    const statut = this.sinistre.value()?.statut;
    return (
      statut !== undefined &&
      statut !== "CLOS" &&
      statut !== "CLASSE_SANS_SUITE"
    );
  });

  /** Engins du sinistre avec le lien vers leur fiche et vers la création d'un OT de réparation. */
  protected readonly engins = computed(() => {
    const s = this.sinistre.value();
    if (!s) {
      return [];
    }
    const refs: { id: string; type: TypeEngin }[] = [];
    if (s.vehiculeId) {
      refs.push({ id: s.vehiculeId, type: "VEHICULE" });
    }
    if (s.remorqueId) {
      refs.push({ id: s.remorqueId, type: "REMORQUE" });
    }
    return refs.map((r) => ({
      ...r,
      immatriculation: this.lookups.engins().get(r.id)?.immatriculation ?? "…",
      lien: [r.type === "VEHICULE" ? "/vehicules" : "/remorques", r.id],
      reparation: {
        enginId: r.id,
        origine: "SINISTRE",
        priorite: s.enginImmobilise ? "HAUTE" : "NORMALE",
        sinistreId: s.id,
        titre: `Réparation suite au sinistre ${s.reference}`,
        type: s.type === "BRIS_DE_GLACE" ? "CARROSSERIE" : "REPARATION",
        typeEngin: r.type,
      },
    }));
  });

  protected libelleTransition(cible: StatutSinistre): string {
    return LIBELLES_TRANSITION[cible] ?? libelle(cible);
  }

  protected async changerStatut(statut: StatutSinistre): Promise<void> {
    this.actionError.set(null);
    this.enCours.set(true);
    try {
      this.sinistre.set(
        await this.api.changerStatutSinistre(this.id(), statut)
      );
      this.toast.success(`Sinistre : ${libelle(statut).toLowerCase()}.`);
    } catch (error) {
      this.actionError.set(httpErrorMessage(error));
    } finally {
      this.enCours.set(false);
    }
  }
}
