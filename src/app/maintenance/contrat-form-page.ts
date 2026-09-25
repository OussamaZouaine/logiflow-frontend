import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import {
  FormField,
  form,
  required,
  submit,
  validate,
} from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { httpErrorMessage } from "../core/api/http-error";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { DocumentsSection } from "../shared/ui/documents-section";
import { isFieldSelectNone } from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import {
  type EnginRef,
  GARANTIES,
  type Garantie,
  libelle,
  nombreOuNull,
  TYPES_ENGIN,
} from "./maintenance";
import { type ContratWrite, MaintenanceApi } from "./maintenance-api";
import { creerLookupsMaintenance } from "./maintenance-lookups";

interface ContratDraft {
  actif: boolean;
  assureurId: string;
  dateEcheance: string;
  dateEffet: string;
  franchise: string;
  numeroPolice: string;
  primeAnnuelle: string;
  type: "FLOTTE" | "ENGIN";
}

function dansUnAn(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Création et fiche (modification + pièces) d'un contrat d'assurance. */
@Component({
  imports: [FormField, RouterLink, DocumentsSection, ...FORM_PAGE_IMPORTS],
  selector: "app-contrat-form-page",
  templateUrl: "./contrat-form-page.html",
})
export class ContratFormPage {
  private readonly api = inject(MaintenanceApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string>();

  protected readonly lookups = creerLookupsMaintenance();
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly libelle = libelle;
  protected readonly garantiesDisponibles = GARANTIES;
  protected readonly typesEngin = TYPES_ENGIN;
  protected readonly edition = computed(() => Boolean(this.id()));
  protected readonly typeOptions = [
    { label: "Flotte (tous les engins)", value: "FLOTTE" },
    { label: "Par engin (liste)", value: "ENGIN" },
  ];
  protected readonly assureurOptions = computed(() =>
    this.lookups.prestataireOptions(["ASSUREUR"])
  );

  protected readonly draft = signal<ContratDraft>({
    actif: true,
    assureurId: "",
    dateEcheance: dansUnAn(),
    dateEffet: new Date().toISOString().slice(0, 10),
    franchise: "",
    numeroPolice: "",
    primeAnnuelle: "",
    type: "FLOTTE",
  });
  protected readonly garanties = signal<ReadonlySet<Garantie>>(
    new Set(["RC", "DOMMAGES"])
  );
  protected readonly engins = signal<ReadonlyMap<string, EnginRef>>(new Map());
  protected readonly chargement = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly contratForm = form(this.draft, (path) => {
    required(path.assureurId, { message: "Choisissez l'assureur." });
    validate(path.assureurId, (ctx) =>
      isFieldSelectNone(ctx.value())
        ? { kind: "required", message: "Choisissez l'assureur." }
        : undefined
    );
    required(path.numeroPolice, {
      message: "Le numéro de police est obligatoire.",
    });
    required(path.dateEffet, { message: "Date d'effet obligatoire." });
    required(path.dateEcheance, { message: "Date d'échéance obligatoire." });
    validate(path.dateEcheance, (ctx) =>
      ctx.value() && ctx.value() < ctx.valueOf(path.dateEffet)
        ? {
            kind: "periode",
            message: "L'échéance doit suivre la date d'effet.",
          }
        : undefined
    );
    for (const champ of [path.franchise, path.primeAnnuelle]) {
      validate(champ, (ctx) => {
        const texte = ctx.value().trim();
        const n = nombreOuNull(texte);
        return texte && (n === null || n < 0)
          ? { kind: "montant", message: "Montant positif attendu." }
          : undefined;
      });
    }
  });

  private chargePour = "";

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id || this.chargePour === id) {
        return;
      }
      this.chargePour = id;
      this.charger(id);
    });
  }

  private async charger(id: string): Promise<void> {
    this.chargement.set(true);
    try {
      const c = await this.api.consulterContrat(id);
      this.draft.set({
        actif: c.actif,
        assureurId: c.assureurId,
        dateEcheance: c.dateEcheance,
        dateEffet: c.dateEffet,
        franchise: c.franchise === null ? "" : String(c.franchise),
        numeroPolice: c.numeroPolice,
        primeAnnuelle: c.primeAnnuelle === null ? "" : String(c.primeAnnuelle),
        type: c.type,
      });
      this.garanties.set(new Set(c.garanties));
      this.engins.set(new Map(c.engins.map((e) => [e.id, e] as const)));
    } catch (error) {
      this.formError.set(httpErrorMessage(error));
    } finally {
      this.chargement.set(false);
    }
  }

  protected basculerActif(): void {
    this.draft.update((d) => ({ ...d, actif: !d.actif }));
  }

  protected basculerGarantie(g: Garantie): void {
    this.garanties.update((actuelles) => {
      const suivantes = new Set(actuelles);
      if (!suivantes.delete(g)) {
        suivantes.add(g);
      }
      return suivantes;
    });
  }

  protected basculerEngin(ref: EnginRef): void {
    this.engins.update((actuels) => {
      const suivants = new Map(actuels);
      if (!suivants.delete(ref.id)) {
        suivants.set(ref.id, ref);
      }
      return suivants;
    });
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    const d = this.draft();
    if (this.garanties().size === 0) {
      this.formError.set("Cochez au moins une garantie.");
      return;
    }
    if (d.type === "ENGIN" && this.engins().size === 0) {
      this.formError.set("Sélectionnez au moins un engin couvert.");
      return;
    }
    await submit(this.contratForm, async () => {
      const corps: ContratWrite = {
        actif: d.actif,
        assureurId: d.assureurId,
        dateEcheance: d.dateEcheance,
        dateEffet: d.dateEffet,
        engins: d.type === "ENGIN" ? [...this.engins().values()] : [],
        franchise: nombreOuNull(d.franchise),
        garanties: GARANTIES.filter((g) => this.garanties().has(g)),
        numeroPolice: d.numeroPolice.trim(),
        primeAnnuelle: nombreOuNull(d.primeAnnuelle),
        type: d.type,
      };
      try {
        const id = this.id();
        if (id) {
          await this.api.modifierContrat(id, corps);
          this.toast.success("Contrat mis à jour.");
        } else {
          const c = await this.api.creerContrat(corps);
          this.toast.success(`Contrat ${c.numeroPolice} enregistré.`);
          await this.router.navigate(["/maintenance/contrats", c.id]);
        }
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
