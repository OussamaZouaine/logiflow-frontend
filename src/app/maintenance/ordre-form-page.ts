import { httpResource } from "@angular/common/http";
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
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import {
  enumToSelectOptions,
  isFieldSelectNone,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import {
  isoInstantToDatetimeLocal,
  toDatetimeLocal,
} from "../shared/ui/iso-datetime";
import { ToastService } from "../shared/ui/toast";
import { LignesCoutEditor } from "./lignes-cout-editor";
import {
  type DetailsOT,
  type LigneCout,
  libelle,
  lignesValides,
  NATURES,
  type Nature,
  natureParDefaut,
  nombreOuNull,
  ORIGINES,
  type OrdreTravail,
  type Origine,
  PRIORITES,
  type Priorite,
  TYPES_ENGIN,
  TYPES_INTERVENTION,
  type TypeEngin,
  type TypeIntervention,
  texteOuNull,
} from "./maintenance";
import { MaintenanceApi } from "./maintenance-api";
import { creerLookupsMaintenance } from "./maintenance-lookups";

interface OrdreDraft {
  budgetEstime: string;
  debutPlanifie: string;
  description: string;
  enginId: string;
  finPlanifiee: string;
  immobilisation: boolean;
  nature: Nature;
  prestataireId: string;
  priorite: Priorite;
  titre: string;
  type: TypeIntervention;
  typeEngin: TypeEngin;
}

function demainMatin(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(8, 0, 0, 0);
  return toDatetimeLocal(d);
}

function dansEnum<T extends string>(
  valeurs: readonly T[],
  valeur: string | null
): T | null {
  return valeur && (valeurs as readonly string[]).includes(valeur)
    ? (valeur as T)
    : null;
}

/** Création et modification d'un ordre de travail (pré-rempli depuis un plan, un sinistre ou l'IA). */
@Component({
  imports: [FormField, LignesCoutEditor, RouterLink, ...FORM_PAGE_IMPORTS],
  selector: "app-ordre-form-page",
  templateUrl: "./ordre-form-page.html",
})
export class OrdreFormPage {
  private readonly api = inject(MaintenanceApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Présent en modification (route ordres-travail/:id/modifier). */
  readonly id = input<string>();

  protected readonly lookups = creerLookupsMaintenance();
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly libelle = libelle;

  protected readonly typeEnginOptions = enumToSelectOptions(
    TYPES_ENGIN,
    libelle
  );
  protected readonly typeOptions = enumToSelectOptions(
    TYPES_INTERVENTION,
    libelle
  );
  protected readonly natureOptions = enumToSelectOptions(NATURES, libelle);
  protected readonly prioriteOptions = enumToSelectOptions(PRIORITES, libelle);

  protected readonly edition = computed(() => Boolean(this.id()));
  private readonly parametres = this.route.snapshot.queryParamMap;
  protected readonly origine: Origine =
    dansEnum(ORIGINES, this.parametres.get("origine")) ?? "MANUELLE";
  protected readonly planId = this.parametres.get("planId");
  protected readonly sinistreId = this.parametres.get("sinistreId");
  protected readonly justification = this.parametres.get("justification");

  protected readonly draft = signal<OrdreDraft>(this.draftInitial());
  protected readonly lignes = signal<LigneCout[]>([]);
  protected readonly chargement = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly enginOptions = computed(() =>
    this.lookups.enginOptions(this.draft().typeEngin)
  );
  protected readonly prestataireOptions = computed(() =>
    withNoneSelectOption("Atelier interne", this.lookups.prestataireOptions())
  );

  /** Plan ou sinistre d'origine, pour le rappeler en tête du formulaire. */
  protected readonly plan = httpResource<{ libelle: string }>(() =>
    this.planId
      ? { url: `${environment.apiBaseUrl}/maintenance/plans/${this.planId}` }
      : undefined
  );
  protected readonly sinistre = httpResource<{ reference: string }>(() =>
    this.sinistreId
      ? {
          url: `${environment.apiBaseUrl}/maintenance/sinistres/${this.sinistreId}`,
        }
      : undefined
  );

  protected readonly ordreForm = form(this.draft, (path) => {
    required(path.enginId, { message: "Choisissez l'engin." });
    required(path.titre, { message: "Le titre est obligatoire." });
    required(path.debutPlanifie, {
      message: "Le début planifié est obligatoire.",
    });
    validate(path.finPlanifiee, (ctx) => {
      const fin = ctx.value();
      const debut = ctx.valueOf(path.debutPlanifie);
      return fin && debut && fin < debut
        ? { kind: "ordre", message: "La fin doit suivre le début." }
        : undefined;
    });
    validate(path.budgetEstime, (ctx) => {
      const texte = ctx.value().trim();
      const nombre = nombreOuNull(texte);
      return texte && (nombre === null || nombre < 0)
        ? { kind: "budget", message: "Montant positif attendu." }
        : undefined;
    });
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

  private draftInitial(): OrdreDraft {
    const q = this.route.snapshot.queryParamMap;
    const type =
      dansEnum(TYPES_INTERVENTION, q.get("type")) ?? "ENTRETIEN_PREVENTIF";
    return {
      budgetEstime: q.get("budget") ?? "",
      debutPlanifie: q.get("debut")
        ? isoInstantToDatetimeLocal(q.get("debut") ?? "")
        : demainMatin(),
      description: q.get("description") ?? "",
      enginId: q.get("enginId") ?? "",
      finPlanifiee: q.get("fin")
        ? isoInstantToDatetimeLocal(q.get("fin") ?? "")
        : "",
      immobilisation: true,
      nature: natureParDefaut(type),
      prestataireId: q.get("prestataireId") ?? "",
      priorite: dansEnum(PRIORITES, q.get("priorite")) ?? "NORMALE",
      titre: q.get("titre") ?? "",
      type,
      typeEngin: dansEnum(TYPES_ENGIN, q.get("typeEngin")) ?? "VEHICULE",
    };
  }

  private async charger(id: string): Promise<void> {
    this.chargement.set(true);
    try {
      const ot = await this.api.consulterOrdre(id);
      this.draft.set({
        budgetEstime: ot.budgetEstime === null ? "" : String(ot.budgetEstime),
        debutPlanifie: ot.debutPlanifie.slice(0, 16),
        description: ot.description ?? "",
        enginId: ot.engin.id,
        finPlanifiee: ot.finPlanifiee ? ot.finPlanifiee.slice(0, 16) : "",
        immobilisation: ot.immobilisation,
        nature: ot.nature,
        prestataireId: ot.prestataireId ?? "",
        priorite: ot.priorite,
        titre: ot.titre,
        type: ot.type,
        typeEngin: ot.engin.type,
      });
    } catch (error) {
      this.formError.set(httpErrorMessage(error));
    } finally {
      this.chargement.set(false);
    }
  }

  protected onTypeEngin(valeur: string): void {
    const type = dansEnum(TYPES_ENGIN, valeur);
    if (type && type !== this.draft().typeEngin) {
      this.draft.update((d) => ({ ...d, enginId: "", typeEngin: type }));
    }
  }

  protected onType(valeur: string): void {
    const type = dansEnum(TYPES_INTERVENTION, valeur);
    if (type) {
      this.draft.update((d) => ({ ...d, nature: natureParDefaut(type), type }));
    }
  }

  protected basculerImmobilisation(): void {
    this.draft.update((d) => ({ ...d, immobilisation: !d.immobilisation }));
  }

  private details(): DetailsOT {
    const d = this.draft();
    return {
      budgetEstime: nombreOuNull(d.budgetEstime),
      debutPlanifie: d.debutPlanifie,
      description: texteOuNull(d.description),
      finPlanifiee: texteOuNull(d.finPlanifiee),
      immobilisation: d.immobilisation,
      nature: d.nature,
      prestataireId: isFieldSelectNone(d.prestataireId)
        ? null
        : texteOuNull(d.prestataireId),
      priorite: d.priorite,
      titre: d.titre.trim(),
      type: d.type,
    };
  }

  /** Modification, OT de réparation d'un sinistre ou création simple. */
  private enregistrer(id: string | undefined): Promise<OrdreTravail> {
    const engin = { id: this.draft().enginId, type: this.draft().typeEngin };
    if (id) {
      return this.api.modifierOrdre(id, this.details());
    }
    if (this.sinistreId) {
      return this.api.creerReparation(this.sinistreId, engin, this.details());
    }
    return this.api.creerOrdre({
      details: this.details(),
      engin,
      lignes: this.lignes(),
      origine: this.origine,
      planId: this.planId,
      sinistreId: null,
    });
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    if (!lignesValides(this.lignes())) {
      this.formError.set(
        "Complétez ou retirez les lignes de coût incomplètes."
      );
      return;
    }
    await submit(this.ordreForm, async () => {
      try {
        const id = this.id();
        const ot = await this.enregistrer(id);
        if (!id && this.sinistreId && this.lignes().length > 0) {
          await this.api.remplacerLignes(ot.id, this.lignes());
        }
        this.toast.success(
          id ? "Ordre de travail mis à jour." : `Ordre ${ot.reference} créé.`
        );
        await this.router.navigate(["/maintenance/ordres-travail", ot.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
