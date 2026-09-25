import { httpResource } from "@angular/common/http";
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { DocumentsSection } from "../shared/ui/documents-section";
import { FICHE_PAGE_IMPORTS } from "../shared/ui/fiche-page";
import { toDatetimeLocal } from "../shared/ui/iso-datetime";
import { StatutChip } from "../shared/ui/statut-chip";
import { ToastService } from "../shared/ui/toast";
import { LignesCoutEditor } from "./lignes-cout-editor";
import {
  formatDate,
  formatDateHeure,
  formatEur,
  formatKm,
  type LigneCout,
  libelle,
  libelleTransitionOT,
  lignesValides,
  nombreOuNull,
  type OrdreTravail,
  otModifiable,
  peutCloturer,
  type StatutOT,
  texteOuNull,
  tonePriorite,
  toneStatutOT,
  transitionsOT,
} from "./maintenance";
import { MaintenanceApi } from "./maintenance-api";
import { creerLookupsMaintenance } from "./maintenance-lookups";
import { MaintenanceTabs } from "./maintenance-tabs";

interface ClotureDraft {
  dateFacture: string;
  diagnostic: string;
  finReelle: string;
  heures: string;
  intervenant: string;
  kilometrage: string;
  numeroFacture: string;
  travauxRealises: string;
}

/** Fiche d'un ordre de travail : cycle de vie, lignes de coût, clôture et documents. */
@Component({
  imports: [
    RouterLink,
    StatutChip,
    LignesCoutEditor,
    DocumentsSection,
    MaintenanceTabs,
    ...FICHE_PAGE_IMPORTS,
  ],
  selector: "app-ordre-detail-page",
  templateUrl: "./ordre-detail-page.html",
})
export class OrdreDetailPage {
  private readonly api = inject(MaintenanceApi);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly lookups = creerLookupsMaintenance();
  protected readonly libelle = libelle;
  protected readonly formatDate = formatDate;
  protected readonly formatDateHeure = formatDateHeure;
  protected readonly formatEur = formatEur;
  protected readonly formatKm = formatKm;
  protected readonly toneStatutOT = toneStatutOT;
  protected readonly tonePriorite = tonePriorite;
  protected readonly libelleTransitionOT = libelleTransitionOT;

  protected readonly ordre = httpResource<OrdreTravail>(() => ({
    url: `${environment.apiBaseUrl}/maintenance/ordres-travail/${this.id()}`,
  }));

  protected readonly lignes = signal<LigneCout[]>([]);
  protected readonly lignesModifiees = signal(false);
  protected readonly actionError = signal<string | null>(null);
  protected readonly enCours = signal(false);
  protected readonly clotureOuverte = signal(false);
  protected readonly cloture = signal<ClotureDraft>({
    dateFacture: "",
    diagnostic: "",
    finReelle: toDatetimeLocal(new Date()),
    heures: "",
    intervenant: "",
    kilometrage: "",
    numeroFacture: "",
    travauxRealises: "",
  });

  protected readonly transitions = computed(() => {
    const ot = this.ordre.value();
    return ot ? transitionsOT(ot.statut) : [];
  });
  protected readonly modifiable = computed(() => {
    const ot = this.ordre.value();
    return ot ? otModifiable(ot.statut) : false;
  });
  protected readonly cloturable = computed(() => {
    const ot = this.ordre.value();
    return ot ? peutCloturer(ot.statut) : false;
  });
  protected readonly lienEngin = computed(() => {
    const ot = this.ordre.value();
    if (!ot) {
      return null;
    }
    return [
      ot.engin.type === "VEHICULE" ? "/vehicules" : "/remorques",
      ot.engin.id,
    ];
  });
  protected readonly ecartBudget = computed(() => {
    const ot = this.ordre.value();
    return ot?.budgetEstime ? ot.totalHt - ot.budgetEstime : null;
  });

  constructor() {
    effect(() => {
      const ot = this.ordre.value();
      if (ot) {
        this.lignes.set(ot.lignes);
        this.lignesModifiees.set(false);
      }
    });
  }

  protected modifierLignes(lignes: LigneCout[]): void {
    this.lignes.set(lignes);
    this.lignesModifiees.set(true);
  }

  protected async enregistrerLignes(): Promise<void> {
    if (!lignesValides(this.lignes())) {
      this.actionError.set("Complétez ou retirez les lignes incomplètes.");
      return;
    }
    await this.executer(
      () => this.api.remplacerLignes(this.id(), this.lignes()),
      "Lignes enregistrées."
    );
  }

  protected async changerStatut(statut: StatutOT): Promise<void> {
    await this.executer(
      () => this.api.changerStatutOrdre(this.id(), statut),
      `Ordre de travail : ${libelle(statut).toLowerCase()}.`
    );
  }

  protected modifierCloture(champ: keyof ClotureDraft, event: Event): void {
    const cible = event.target;
    if (
      cible instanceof HTMLInputElement ||
      cible instanceof HTMLTextAreaElement
    ) {
      this.cloture.update((c) => ({ ...c, [champ]: cible.value }));
    }
  }

  protected async cloturer(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.lignesModifiees()) {
      this.actionError.set("Enregistrez d'abord les lignes de coût.");
      return;
    }
    const c = this.cloture();
    const reussi = await this.executer(
      () =>
        this.api.cloturerOrdre(this.id(), {
          dateFacture: texteOuNull(c.dateFacture),
          diagnostic: texteOuNull(c.diagnostic),
          finReelle: c.finReelle,
          heures: nombreOuNull(c.heures),
          intervenant: texteOuNull(c.intervenant),
          kilometrage: nombreOuNull(c.kilometrage),
          numeroFacture: texteOuNull(c.numeroFacture),
          travauxRealises: texteOuNull(c.travauxRealises),
        }),
      "Ordre de travail clôturé."
    );
    if (reussi) {
      this.clotureOuverte.set(false);
    }
  }

  private async executer(
    action: () => Promise<OrdreTravail>,
    message: string
  ): Promise<boolean> {
    this.actionError.set(null);
    this.enCours.set(true);
    try {
      this.ordre.set(await action());
      this.toast.success(message);
      return true;
    } catch (error) {
      this.actionError.set(httpErrorMessage(error));
      return false;
    } finally {
      this.enCours.set(false);
    }
  }
}
