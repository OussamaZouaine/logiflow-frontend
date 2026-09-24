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
  email,
  FormField,
  form,
  max,
  min,
  required,
  submit,
  validate,
} from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import {
  enumToSelectOptions,
  type FieldSelectOption,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import type { Site } from "../sites/site";
import {
  CATEGORIES_PERMIS,
  type CategoriePermis,
  chauffeurToDraft,
  draftToCreate,
  draftToUpdate,
  emptyChauffeurDraft,
  erreurHabilitation,
  type HabilitationDraft,
  habilitationLabel,
  TYPES_CONTRAT,
  TYPES_HABILITATION,
  type TypeHabilitation,
  typeContratLabel,
} from "./chauffeur";
import { ChauffeurApi } from "./chauffeur-api";

const MATRICULE_PATTERN = /^[A-Za-z0-9-]{2,30}$/;

@Component({
  imports: [FormField, RouterLink, ...FORM_PAGE_IMPORTS],
  selector: "app-chauffeur-form-page",
  templateUrl: "./chauffeur-form-page.html",
})
export class ChauffeurFormPage {
  private readonly api = inject(ChauffeurApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  /** Présent en modification (route chauffeurs/:id/modifier). */
  readonly id = input<string>();

  protected readonly edition = computed(() => Boolean(this.id()));
  protected readonly categoriesPermis = CATEGORIES_PERMIS;
  protected readonly habilitationLabel = habilitationLabel;
  protected readonly erreurHabilitation = erreurHabilitation;
  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;

  protected readonly contratOptions = withNoneSelectOption(
    "Non renseigné",
    enumToSelectOptions(TYPES_CONTRAT, typeContratLabel)
  );
  protected readonly habilitationOptions = enumToSelectOptions(
    TYPES_HABILITATION,
    habilitationLabel
  );

  protected readonly sites = httpResource<PageResponse<Site>>(() => ({
    params: { page: 0, size: 100 },
    url: `${environment.apiBaseUrl}/sites`,
  }));
  protected readonly siteOptions = computed<readonly FieldSelectOption[]>(() =>
    withNoneSelectOption(
      "Aucun",
      this.sites.hasValue()
        ? this.sites.value().content.map((site) => ({
            label: `${site.code} — ${site.libelle}`,
            value: site.id,
          }))
        : []
    )
  );

  protected readonly draft = signal(emptyChauffeurDraft());
  protected readonly chargement = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly passeportOuvert = signal(false);

  protected readonly chauffeurForm = form(this.draft, (path) => {
    validate(path.matricule, (ctx) => {
      if (this.edition()) {
        return;
      }
      const valeur = ctx.value().trim();
      if (!valeur) {
        return { kind: "required", message: "Le matricule est obligatoire." };
      }
      return MATRICULE_PATTERN.test(valeur)
        ? undefined
        : {
            kind: "matricule",
            message: "2 à 30 lettres, chiffres ou tirets (ex. DRV-0042).",
          };
    });
    required(path.nom, { message: "Le nom est obligatoire." });
    required(path.prenom, { message: "Le prénom est obligatoire." });
    email(path.email, { message: "Adresse e-mail invalide." });
    min(path.experienceAnnees, 0, {
      message: "L'expérience ne peut pas être négative.",
    });
    min(path.soldeTempsConduiteHeures, 0, {
      message: "Le solde ne peut pas être négatif.",
    });
    max(path.soldeTempsConduiteHeures, 90, {
      message: "Au plus 90 h sur deux semaines (règlement CE 561/2006).",
    });
    validate(path.dateExpirationPermis, (ctx) =>
      ordreDates(ctx.valueOf(path.dateObtentionPermis), ctx.value(), "permis")
    );
    validate(path.dateExpirationPasseport, (ctx) =>
      ordreDates(
        ctx.valueOf(path.dateDelivrancePasseport),
        ctx.value(),
        "passeport"
      )
    );
    validate(path.dateExpirationVisa, (ctx) =>
      ordreDates(ctx.valueOf(path.dateDelivranceVisa), ctx.value(), "visa")
    );
  });

  protected readonly habilitationsInvalides = computed(() =>
    this.draft().habilitations.some((h) => erreurHabilitation(h) !== null)
  );

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
      const chauffeur = await this.api.get(id);
      this.draft.set(chauffeurToDraft(chauffeur));
      this.passeportOuvert.set(Boolean(chauffeur.numeroPasseport));
    } catch (error) {
      this.formError.set(httpErrorMessage(error));
    } finally {
      this.chargement.set(false);
    }
  }

  protected categorieCochee(categorie: CategoriePermis): boolean {
    return this.draft().categoriesPermis.includes(categorie);
  }

  protected basculerCategorie(categorie: CategoriePermis): void {
    this.draft.update((draft) => ({
      ...draft,
      categoriesPermis: draft.categoriesPermis.includes(categorie)
        ? draft.categoriesPermis.filter((c) => c !== categorie)
        : [...draft.categoriesPermis, categorie],
    }));
  }

  protected ajouterHabilitation(): void {
    const libres = TYPES_HABILITATION.filter(
      (type) => !this.draft().habilitations.some((h) => h.type === type)
    );
    const nouvelle: HabilitationDraft = {
      dateExpiration: "",
      dateObtention: "",
      reference: "",
      type: libres[0] ?? "FIMO_FCO",
    };
    this.draft.update((draft) => ({
      ...draft,
      habilitations: [...draft.habilitations, nouvelle],
    }));
  }

  protected retirerHabilitation(index: number): void {
    this.draft.update((draft) => ({
      ...draft,
      habilitations: draft.habilitations.filter((_, i) => i !== index),
    }));
  }

  protected modifierHabilitation(
    index: number,
    changement: Partial<HabilitationDraft>
  ): void {
    this.draft.update((draft) => ({
      ...draft,
      habilitations: draft.habilitations.map((h, i) =>
        i === index ? { ...h, ...changement } : h
      ),
    }));
  }

  protected onTypeHabilitation(index: number, valeur: string): void {
    if ((TYPES_HABILITATION as readonly string[]).includes(valeur)) {
      this.modifierHabilitation(index, { type: valeur as TypeHabilitation });
    }
  }

  protected onReferenceHabilitation(index: number, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.modifierHabilitation(index, { reference: event.target.value });
    }
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    if (this.habilitationsInvalides()) {
      this.formError.set("Complétez ou retirez les habilitations incomplètes.");
      return;
    }
    await submit(this.chauffeurForm, async () => {
      try {
        const id = this.id();
        const chauffeur = id
          ? await this.api.update(id, draftToUpdate(this.draft()))
          : await this.api.create(draftToCreate(this.draft()));
        this.toast.success(id ? "Chauffeur mis à jour." : "Chauffeur créé.");
        await this.router.navigate(["/chauffeurs", chauffeur.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}

function ordreDates(
  debut: string,
  fin: string,
  libelle: string
): { kind: string; message: string } | undefined {
  if (debut && fin && fin <= debut) {
    return {
      kind: "ordreDates",
      message: `L'expiration du ${libelle} doit suivre sa délivrance.`,
    };
  }
  return undefined;
}
