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
import { formatChauffeurLabel } from "../chauffeurs/chauffeur";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { firstFieldError } from "../core/forms/first-field-error";
import { fieldClasses, showFieldError } from "../core/forms/show-field-error";
import {
  enumToSelectOptions,
  isFieldSelectNone,
  withNoneSelectOption,
} from "../shared/ui/field-select";
import { FORM_PAGE_IMPORTS } from "../shared/ui/form-page";
import { toDatetimeLocal } from "../shared/ui/iso-datetime";
import { ToastService } from "../shared/ui/toast";
import {
  type ContratAssurance,
  GRAVITES,
  type Gravite,
  libelle,
  nombreOuNull,
  RESPONSABILITES,
  type Responsabilite,
  type Sinistre,
  TYPES_SINISTRE,
  type TypeSinistre,
  texteOuNull,
} from "./maintenance";
import { MaintenanceApi, type SinistreWrite } from "./maintenance-api";
import { creerLookupsMaintenance } from "./maintenance-lookups";

interface SinistreDraft {
  blesses: boolean;
  chauffeurId: string;
  constatAmiable: boolean;
  dateDeclarationAssureur: string;
  dateExpertise: string;
  dateSurvenance: string;
  description: string;
  enginImmobilise: boolean;
  estimationDommages: string;
  expertId: string;
  franchise: string;
  gravite: Gravite;
  indemnite: string;
  lieu: string;
  numeroDossierAssureur: string;
  rapportPolice: boolean;
  remorqueId: string;
  responsabilite: Responsabilite;
  tiersAssureur: string;
  tiersImmatriculation: string;
  tiersNom: string;
  tiersNumeroPolice: string;
  type: TypeSinistre;
  vehiculeId: string;
}

type CaseACocher =
  | "blesses"
  | "constatAmiable"
  | "enginImmobilise"
  | "rapportPolice";

function montantFacultatif(
  valeur: string
): { kind: string; message: string } | undefined {
  const texte = valeur.trim();
  const nombre = nombreOuNull(texte);
  return texte && (nombre === null || nombre < 0)
    ? { kind: "montant", message: "Montant positif attendu." }
    : undefined;
}

/** Déclaration et suivi d'un sinistre (circonstances, tiers, assurance, montants). */
@Component({
  imports: [FormField, RouterLink, ...FORM_PAGE_IMPORTS],
  selector: "app-sinistre-form-page",
  templateUrl: "./sinistre-form-page.html",
})
export class SinistreFormPage {
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

  protected readonly typeOptions = enumToSelectOptions(TYPES_SINISTRE, libelle);
  protected readonly graviteOptions = enumToSelectOptions(GRAVITES, libelle);
  protected readonly responsabiliteOptions = enumToSelectOptions(
    RESPONSABILITES,
    libelle
  );
  protected readonly vehiculeOptions = computed(() =>
    withNoneSelectOption(
      "Aucun véhicule",
      this.lookups.enginOptions("VEHICULE")
    )
  );
  protected readonly remorqueOptions = computed(() =>
    withNoneSelectOption(
      "Aucune remorque",
      this.lookups.enginOptions("REMORQUE")
    )
  );
  protected readonly expertOptions = computed(() =>
    withNoneSelectOption(
      "Aucun expert",
      this.lookups.prestataireOptions(["EXPERT"])
    )
  );

  private readonly chauffeurs = httpResource<
    PageResponse<{ id: string; matricule: string; nom: string; prenom: string }>
  >(() => ({
    params: { page: 0, size: 100 },
    url: `${environment.apiBaseUrl}/chauffeurs`,
  }));
  protected readonly chauffeurOptions = computed(() =>
    withNoneSelectOption(
      "Non renseigné",
      (this.chauffeurs.value()?.content ?? []).map((c) => ({
        label: formatChauffeurLabel(c),
        value: c.id,
      }))
    )
  );

  private voyageId: string | null =
    this.route.snapshot.queryParamMap.get("voyageId");
  private contratId: string | null = null;

  protected readonly draft = signal<SinistreDraft>({
    blesses: false,
    chauffeurId: this.route.snapshot.queryParamMap.get("chauffeurId") ?? "",
    constatAmiable: false,
    dateDeclarationAssureur: "",
    dateExpertise: "",
    dateSurvenance: toDatetimeLocal(new Date()),
    description: "",
    enginImmobilise: false,
    estimationDommages: "",
    expertId: "",
    franchise: "",
    gravite: "MATERIEL_LEGER",
    indemnite: "",
    lieu: "",
    numeroDossierAssureur: "",
    rapportPolice: false,
    remorqueId: this.route.snapshot.queryParamMap.get("remorqueId") ?? "",
    responsabilite: "A_DETERMINER",
    tiersAssureur: "",
    tiersImmatriculation: "",
    tiersNom: "",
    tiersNumeroPolice: "",
    type: "ACCROCHAGE",
    vehiculeId: this.route.snapshot.queryParamMap.get("vehiculeId") ?? "",
  });
  protected readonly tiersOuvert = signal(false);
  protected readonly chargement = signal(false);
  protected readonly formError = signal<string | null>(null);

  /** Contrat qui couvrira le sinistre (repris automatiquement à l'enregistrement). */
  protected readonly contratApplicable = httpResource<ContratAssurance | null>(
    () => {
      const d = this.draft();
      const vehicule = isFieldSelectNone(d.vehiculeId) ? "" : d.vehiculeId;
      const remorque = isFieldSelectNone(d.remorqueId) ? "" : d.remorqueId;
      const enginId = vehicule || remorque;
      if (!enginId || this.edition()) {
        return;
      }
      return {
        params: {
          date: d.dateSurvenance.slice(0, 10),
          enginId,
          typeEngin: vehicule ? "VEHICULE" : "REMORQUE",
        },
        url: `${environment.apiBaseUrl}/maintenance/contrats-assurance/applicable`,
      };
    }
  );

  protected readonly sinistreForm = form(this.draft, (path) => {
    required(path.dateSurvenance, {
      message: "La date du sinistre est obligatoire.",
    });
    required(path.description, { message: "Décrivez les circonstances." });
    validate(path.vehiculeId, (ctx) => {
      const vide = (v: string) => !v || isFieldSelectNone(v);
      return vide(ctx.value()) && vide(ctx.valueOf(path.remorqueId))
        ? { kind: "engin", message: "Un véhicule ou une remorque est requis." }
        : undefined;
    });
    for (const champ of [
      path.estimationDommages,
      path.franchise,
      path.indemnite,
    ]) {
      validate(champ, (ctx) => montantFacultatif(ctx.value()));
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
      const s = await this.api.consulterSinistre(id);
      const texte = (v: number | null) => (v === null ? "" : String(v));
      this.voyageId = s.voyageId;
      this.contratId = s.contratId;
      this.draft.set({
        blesses: s.blesses,
        chauffeurId: s.chauffeurId ?? "",
        constatAmiable: s.constatAmiable,
        dateDeclarationAssureur: s.dateDeclarationAssureur ?? "",
        dateExpertise: s.dateExpertise ?? "",
        dateSurvenance: s.dateSurvenance.slice(0, 16),
        description: s.description,
        enginImmobilise: s.enginImmobilise,
        estimationDommages: texte(s.estimationDommages),
        expertId: s.expertId ?? "",
        franchise: texte(s.franchise),
        gravite: s.gravite,
        indemnite: texte(s.indemnite),
        lieu: s.lieu ?? "",
        numeroDossierAssureur: s.numeroDossierAssureur ?? "",
        rapportPolice: s.rapportPolice,
        remorqueId: s.remorqueId ?? "",
        responsabilite: s.responsabilite,
        tiersAssureur: s.tiers?.assureur ?? "",
        tiersImmatriculation: s.tiers?.immatriculation ?? "",
        tiersNom: s.tiers?.nom ?? "",
        tiersNumeroPolice: s.tiers?.numeroPolice ?? "",
        type: s.type,
        vehiculeId: s.vehiculeId ?? "",
      });
      this.tiersOuvert.set(Boolean(s.tiers));
    } catch (error) {
      this.formError.set(httpErrorMessage(error));
    } finally {
      this.chargement.set(false);
    }
  }

  protected basculer(champ: CaseACocher): void {
    this.draft.update((d) => ({ ...d, [champ]: !d[champ] }));
  }

  private corps(): SinistreWrite {
    const d = this.draft();
    const id = (v: string) => (isFieldSelectNone(v) ? null : texteOuNull(v));
    return {
      blesses: d.blesses,
      chauffeurId: id(d.chauffeurId),
      constatAmiable: d.constatAmiable,
      contratId: this.contratId,
      dateDeclarationAssureur: texteOuNull(d.dateDeclarationAssureur),
      dateExpertise: texteOuNull(d.dateExpertise),
      dateSurvenance: d.dateSurvenance,
      description: d.description.trim(),
      enginImmobilise: d.enginImmobilise,
      estimationDommages: nombreOuNull(d.estimationDommages),
      expertId: id(d.expertId),
      franchise: nombreOuNull(d.franchise),
      gravite: d.gravite,
      indemnite: nombreOuNull(d.indemnite),
      latitude: null,
      lieu: texteOuNull(d.lieu),
      longitude: null,
      numeroDossierAssureur: texteOuNull(d.numeroDossierAssureur),
      rapportPolice: d.rapportPolice,
      remorqueId: id(d.remorqueId),
      responsabilite: d.responsabilite,
      tiers:
        this.tiersOuvert() && d.tiersNom.trim()
          ? {
              assureur: texteOuNull(d.tiersAssureur),
              immatriculation: texteOuNull(d.tiersImmatriculation),
              nom: d.tiersNom.trim(),
              numeroPolice: texteOuNull(d.tiersNumeroPolice),
            }
          : null,
      type: d.type,
      vehiculeId: id(d.vehiculeId),
      voyageId: this.voyageId,
    };
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.formError.set(null);
    await submit(this.sinistreForm, async () => {
      try {
        const id = this.id();
        const s: Sinistre = id
          ? await this.api.modifierSinistre(id, this.corps())
          : await this.api.declarerSinistre(this.corps());
        this.toast.success(
          id ? "Sinistre mis à jour." : `Sinistre ${s.reference} déclaré.`
        );
        await this.router.navigate(["/maintenance/sinistres", s.id]);
      } catch (error) {
        this.formError.set(httpErrorMessage(error));
      }
    });
  }
}
