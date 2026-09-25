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
import { httpErrorMessage } from "../core/api/http-error";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import {
  enumToSelectOptions,
  isFieldSelectNone,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import {
  libelle,
  nombreOuNull,
  TYPES_ENGIN,
  TYPES_INTERVENTION,
  type TypeEngin,
  type TypeIntervention,
  texteOuNull,
} from "./maintenance";
import { MaintenanceApi, type ParametresPlan } from "./maintenance-api";
import { creerLookupsMaintenance } from "./maintenance-lookups";

interface PlanDraft {
  actif: boolean;
  coutEstime: string;
  derniereDate: string;
  derniereHeures: string;
  derniereKm: string;
  dureeEstimeeMin: string;
  enginId: string;
  libelle: string;
  periodiciteHeures: string;
  periodiciteKm: string;
  periodiciteMois: string;
  prestataireId: string;
  seuilAlerteJours: string;
  seuilAlerteKm: string;
  type: TypeIntervention;
  typeEngin: TypeEngin;
}

const ENTIER_POSITIF = /^\d+$/;

function entierFacultatif(
  valeur: string
): { kind: string; message: string } | undefined {
  const texte = valeur.trim();
  return texte && !ENTIER_POSITIF.test(texte)
    ? { kind: "entier", message: "Nombre entier positif attendu." }
    : undefined;
}

/** Création et modification d'un plan d'entretien. */
@Component({
  imports: [FormField, RouterLink, ...FORM_PAGE_IMPORTS],
  selector: "app-plan-form-page",
  templateUrl: "./plan-form-page.html",
})
export class PlanFormPage {
  private readonly api = inject(MaintenanceApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string>();

  protected readonly lookups = creerLookupsMaintenance();
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly libelle = libelle;
  protected readonly edition = computed(() => Boolean(this.id()));

  protected readonly typeEnginOptions = enumToSelectOptions(
    TYPES_ENGIN,
    libelle
  );
  protected readonly typeOptions = enumToSelectOptions(
    TYPES_INTERVENTION,
    libelle
  );
  protected readonly prestataireOptions = computed(() =>
    withNoneSelectOption("Atelier interne", this.lookups.prestataireOptions())
  );

  protected readonly draft = signal<PlanDraft>({
    actif: true,
    coutEstime: "",
    derniereDate: "",
    derniereHeures: "",
    derniereKm: "",
    dureeEstimeeMin: "240",
    enginId: this.route.snapshot.queryParamMap.get("enginId") ?? "",
    libelle: "",
    periodiciteHeures: "",
    periodiciteKm: "40000",
    periodiciteMois: "12",
    prestataireId: "",
    seuilAlerteJours: "15",
    seuilAlerteKm: "2000",
    type: "ENTRETIEN_PREVENTIF",
    typeEngin:
      this.route.snapshot.queryParamMap.get("typeEngin") === "REMORQUE"
        ? "REMORQUE"
        : "VEHICULE",
  });
  protected readonly enginOptions = computed(() =>
    this.lookups.enginOptions(this.draft().typeEngin)
  );
  protected readonly chargement = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly planForm = form(this.draft, (path) => {
    required(path.enginId, { message: "Choisissez l'engin." });
    required(path.libelle, { message: "Le libellé est obligatoire." });
    for (const champ of [
      path.periodiciteKm,
      path.periodiciteMois,
      path.periodiciteHeures,
      path.seuilAlerteKm,
      path.seuilAlerteJours,
      path.dureeEstimeeMin,
      path.derniereKm,
      path.derniereHeures,
    ]) {
      validate(champ, (ctx) => entierFacultatif(ctx.value()));
    }
    validate(path.periodiciteMois, (ctx) => {
      const aucune = [
        ctx.valueOf(path.periodiciteKm),
        ctx.value(),
        ctx.valueOf(path.periodiciteHeures),
      ].every((v) => !v.trim());
      return aucune
        ? {
            kind: "periodicite",
            message: "Renseignez au moins une périodicité.",
          }
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

  private async charger(id: string): Promise<void> {
    this.chargement.set(true);
    try {
      const p = await this.api.consulterPlan(id);
      const texte = (v: number | null) => (v === null ? "" : String(v));
      this.draft.set({
        actif: p.actif,
        coutEstime: texte(p.coutEstime),
        derniereDate: p.derniereDate ?? "",
        derniereHeures: texte(p.derniereHeures),
        derniereKm: texte(p.derniereKm),
        dureeEstimeeMin: String(p.dureeEstimeeMin),
        enginId: p.engin.id,
        libelle: p.libelle,
        periodiciteHeures: texte(p.periodiciteHeures),
        periodiciteKm: texte(p.periodiciteKm),
        periodiciteMois: texte(p.periodiciteMois),
        prestataireId: p.prestataireId ?? "",
        seuilAlerteJours: String(p.seuilAlerteJours),
        seuilAlerteKm: String(p.seuilAlerteKm),
        type: p.type,
        typeEngin: p.engin.type,
      });
    } catch (error) {
      this.formError.set(httpErrorMessage(error));
    } finally {
      this.chargement.set(false);
    }
  }

  protected onTypeEngin(valeur: string): void {
    if ((TYPES_ENGIN as readonly string[]).includes(valeur)) {
      this.draft.update((d) => ({
        ...d,
        enginId: "",
        typeEngin: valeur as TypeEngin,
      }));
    }
  }

  protected basculerActif(): void {
    this.draft.update((d) => ({ ...d, actif: !d.actif }));
  }

  private parametres(): ParametresPlan {
    const d = this.draft();
    return {
      actif: d.actif,
      coutEstime: nombreOuNull(d.coutEstime),
      dureeEstimeeMin: nombreOuNull(d.dureeEstimeeMin) ?? 0,
      libelle: d.libelle.trim(),
      periodiciteHeures: nombreOuNull(d.periodiciteHeures),
      periodiciteKm: nombreOuNull(d.periodiciteKm),
      periodiciteMois: nombreOuNull(d.periodiciteMois),
      prestataireId: isFieldSelectNone(d.prestataireId)
        ? null
        : texteOuNull(d.prestataireId),
      seuilAlerteJours: nombreOuNull(d.seuilAlerteJours) ?? 0,
      seuilAlerteKm: nombreOuNull(d.seuilAlerteKm) ?? 0,
      type: d.type,
    };
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.planForm, async () => {
      try {
        const id = this.id();
        const d = this.draft();
        const plan = id
          ? await this.api.modifierPlan(id, this.parametres())
          : await this.api.creerPlan({
              derniereDate: texteOuNull(d.derniereDate),
              derniereHeures: nombreOuNull(d.derniereHeures),
              derniereKm: nombreOuNull(d.derniereKm),
              engin: { id: d.enginId, type: d.typeEngin },
              parametres: this.parametres(),
            });
        this.toast.success(id ? "Plan mis à jour." : "Plan créé.");
        await this.router.navigate(["/maintenance/plans", plan.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
