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
  required,
  submit,
} from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { httpErrorMessage } from "../core/api/http-error";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import { DocumentsSection } from "../shared/ui/documents-section";
import { enumToSelectOptions } from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { ToastService } from "../shared/ui/toast";
import {
  libelle,
  TYPES_PRESTATAIRE,
  type TypePrestataire,
  texteOuNull,
} from "./maintenance";
import { MaintenanceApi, type PrestataireWrite } from "./maintenance-api";

interface PrestataireDraft {
  actif: boolean;
  adresse: string;
  code: string;
  contactNom: string;
  email: string;
  notes: string;
  raisonSociale: string;
  siret: string;
  telephone: string;
  type: TypePrestataire;
}

/** Création et fiche (modification + pièces) d'un prestataire. */
@Component({
  imports: [FormField, RouterLink, DocumentsSection, ...FORM_PAGE_IMPORTS],
  selector: "app-prestataire-form-page",
  templateUrl: "./prestataire-form-page.html",
})
export class PrestataireFormPage {
  private readonly api = inject(MaintenanceApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input<string>();

  protected readonly firstFieldError = firstFieldError;
  protected readonly showFieldError = showFieldError;
  protected readonly fieldClasses = fieldClasses;
  protected readonly edition = computed(() => Boolean(this.id()));
  protected readonly typeOptions = enumToSelectOptions(
    TYPES_PRESTATAIRE,
    libelle
  );

  protected readonly draft = signal<PrestataireDraft>({
    actif: true,
    adresse: "",
    code: "",
    contactNom: "",
    email: "",
    notes: "",
    raisonSociale: "",
    siret: "",
    telephone: "",
    type: "GARAGE",
  });
  protected readonly chargement = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly prestataireForm = form(this.draft, (path) => {
    required(path.raisonSociale, {
      message: "La raison sociale est obligatoire.",
    });
    required(path.code, {
      message: "Le code est obligatoire.",
      when: () => !this.edition(),
    });
    email(path.email, { message: "Adresse e-mail invalide." });
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
      const p = await this.api.consulterPrestataire(id);
      this.draft.set({
        actif: p.actif,
        adresse: p.adresse ?? "",
        code: p.code,
        contactNom: p.contactNom ?? "",
        email: p.email ?? "",
        notes: p.notes ?? "",
        raisonSociale: p.raisonSociale,
        siret: p.siret ?? "",
        telephone: p.telephone ?? "",
        type: p.type,
      });
    } catch (error) {
      this.formError.set(httpErrorMessage(error));
    } finally {
      this.chargement.set(false);
    }
  }

  protected basculerActif(): void {
    this.draft.update((d) => ({ ...d, actif: !d.actif }));
  }

  private corps(): PrestataireWrite {
    const d = this.draft();
    return {
      actif: d.actif,
      adresse: texteOuNull(d.adresse),
      code: d.code.trim(),
      contactNom: texteOuNull(d.contactNom),
      email: texteOuNull(d.email),
      notes: texteOuNull(d.notes),
      raisonSociale: d.raisonSociale.trim(),
      siret: texteOuNull(d.siret),
      telephone: texteOuNull(d.telephone),
      type: d.type,
    };
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.prestataireForm, async () => {
      try {
        const id = this.id();
        if (id) {
          await this.api.modifierPrestataire(id, this.corps());
          this.toast.success("Prestataire mis à jour.");
        } else {
          const p = await this.api.creerPrestataire(this.corps());
          this.toast.success(`Prestataire ${p.code} créé.`);
          await this.router.navigate(["/maintenance/prestataires", p.id]);
        }
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
