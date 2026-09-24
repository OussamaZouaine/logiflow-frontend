import { isFieldSelectNone } from "../shared/ui/field-select";
import type { ApercuTone } from "../tableau/apercu";

export const CHAUFFEUR_STATUTS = ["ACTIF", "INACTIF", "SUSPENDU"] as const;
export type ChauffeurStatut = (typeof CHAUFFEUR_STATUTS)[number];

export const CHAUFFEUR_DISPONIBILITES = [
  "DISPONIBLE",
  "EN_VOYAGE",
  "EN_REPOS",
  "EN_CONGE",
  "INDISPONIBLE",
] as const;
export type ChauffeurDisponibilite = (typeof CHAUFFEUR_DISPONIBILITES)[number];

export const TYPES_CONTRAT = ["CDI", "CDD", "INTERIM", "FREELANCE"] as const;
export type TypeContrat = (typeof TYPES_CONTRAT)[number];

export const TYPES_HABILITATION = [
  "FIMO_FCO",
  "CARTE_CONDUCTEUR",
  "VISITE_MEDICALE",
  "ADR_BASE",
  "ADR_CITERNE",
] as const;
export type TypeHabilitation = (typeof TYPES_HABILITATION)[number];

export const CATEGORIES_PERMIS = ["B", "C1", "C", "C1E", "CE"] as const;
export type CategoriePermis = (typeof CATEGORIES_PERMIS)[number];

/** Seuil d'alerte avant expiration (habilitations, permis, pièces). */
export const JOURS_ALERTE_EXPIRATION = 30;

export interface Habilitation {
  dateExpiration: string;
  dateObtention: string;
  reference: string;
  type: string;
}

/** Chauffeur tel que renvoyé par l'API (ChauffeurResponse). */
export interface Chauffeur {
  adresse: string | null;
  categoriesPermis: string[];
  cin: string | null;
  dateDelivrancePasseport: string | null;
  dateDelivranceVisa: string | null;
  dateEmbauche: string | null;
  dateExpirationPasseport: string | null;
  dateExpirationPermis: string | null;
  dateExpirationVisa: string | null;
  dateNaissance: string | null;
  dateObtentionPermis: string | null;
  disponibilite: string;
  email: string | null;
  experienceAnnees: number | null;
  habilitations: Habilitation[];
  id: string;
  lieuNaissance: string | null;
  matricule: string;
  nationalite: string | null;
  nom: string;
  numeroPasseport: string | null;
  numeroPermis: string | null;
  numeroVisa: string | null;
  paysDelivrancePasseport: string | null;
  paysVisa: string | null;
  prenom: string;
  siteRattachementId: string | null;
  soldeTempsConduiteMinutes: number;
  specialisation: string | null;
  statut: string;
  telephone: string | null;
  typeContrat: string | null;
  typeVisa: string | null;
}

export type ChauffeurListItem = Pick<
  Chauffeur,
  "disponibilite" | "id" | "matricule" | "nom" | "prenom" | "statut"
>;

// ─── Libellés et tons ────────────────────────────────────────────────────────

const STATUT_LABELS: Record<ChauffeurStatut, string> = {
  ACTIF: "Actif",
  INACTIF: "Inactif",
  SUSPENDU: "Suspendu",
};

const DISPONIBILITE_LABELS: Record<ChauffeurDisponibilite, string> = {
  DISPONIBLE: "Disponible",
  EN_CONGE: "En congé",
  EN_REPOS: "En repos",
  EN_VOYAGE: "En voyage",
  INDISPONIBLE: "Indisponible",
};

const CONTRAT_LABELS: Record<TypeContrat, string> = {
  CDD: "CDD",
  CDI: "CDI",
  FREELANCE: "Indépendant",
  INTERIM: "Intérim",
};

const HABILITATION_LABELS: Record<TypeHabilitation, string> = {
  ADR_BASE: "ADR (base)",
  ADR_CITERNE: "ADR citerne",
  CARTE_CONDUCTEUR: "Carte conducteur",
  FIMO_FCO: "FIMO / FCO",
  VISITE_MEDICALE: "Visite médicale",
};

function libelle<T extends string>(
  table: Record<T, string>,
  valeur: string | null | undefined
): string {
  if (!valeur) {
    return "—";
  }
  return (table as Record<string, string>)[valeur] ?? valeur;
}

export function chauffeurStatutLabel(statut: string): string {
  return libelle(STATUT_LABELS, statut);
}

export function chauffeurDisponibiliteLabel(disponibilite: string): string {
  return libelle(DISPONIBILITE_LABELS, disponibilite);
}

export function typeContratLabel(type: string | null): string {
  return libelle(CONTRAT_LABELS, type);
}

export function habilitationLabel(type: string): string {
  return libelle(HABILITATION_LABELS, type);
}

export function chauffeurStatutTone(statut: string): ApercuTone {
  switch (statut) {
    case "ACTIF":
      return "pine";
    case "SUSPENDU":
      return "brake";
    default:
      return "muted";
  }
}

export function chauffeurDisponibiliteTone(disponibilite: string): ApercuTone {
  switch (disponibilite) {
    case "DISPONIBLE":
      return "pine";
    case "EN_VOYAGE":
      return "ink";
    case "INDISPONIBLE":
      return "brake";
    default:
      return "amber";
  }
}

// ─── Mise en forme ───────────────────────────────────────────────────────────

export function formatChauffeurNomComplet(nom: string, prenom: string): string {
  return `${prenom.trim()} ${nom.trim()}`.trim();
}

export function formatChauffeurLabel(
  chauffeur: Pick<Chauffeur, "matricule" | "nom" | "prenom">
): string {
  return `${chauffeur.matricule} — ${formatChauffeurNomComplet(chauffeur.nom, chauffeur.prenom)}`;
}

export function chauffeurLabelFromLookup(
  chauffeurId: string,
  chauffeursById: ReadonlyMap<
    string,
    Pick<Chauffeur, "matricule" | "nom" | "prenom">
  >
): string {
  const chauffeur = chauffeursById.get(chauffeurId);
  return chauffeur ? formatChauffeurLabel(chauffeur) : chauffeurId;
}

/** « 35 h 05 » à partir d'un solde en minutes. */
export function formatSoldeConduite(minutes: number): string {
  const heures = Math.floor(minutes / 60);
  return `${heures} h ${String(minutes % 60).padStart(2, "0")}`;
}

export function formatChauffeurDate(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const [annee, mois, jour] = iso.slice(0, 10).split("-");
  return annee && mois && jour ? `${jour}/${mois}/${annee}` : iso;
}

// ─── Validité (habilitations, permis, passeport) ─────────────────────────────

export type EtatValidite = "valide" | "bientot" | "expire" | "absent";

const JOUR_MS = 86_400_000;

/** Jours restants avant l'expiration (négatif = expiré). */
export function joursAvantExpiration(
  dateExpiration: string,
  aujourdhui: Date
): number {
  const fin = Date.parse(`${dateExpiration.slice(0, 10)}T00:00:00Z`);
  const debut = Date.UTC(
    aujourdhui.getUTCFullYear(),
    aujourdhui.getUTCMonth(),
    aujourdhui.getUTCDate()
  );
  return Math.round((fin - debut) / JOUR_MS);
}

export function etatValidite(
  dateExpiration: string | null,
  aujourdhui: Date
): EtatValidite {
  if (!dateExpiration) {
    return "absent";
  }
  const jours = joursAvantExpiration(dateExpiration, aujourdhui);
  if (jours < 0) {
    return "expire";
  }
  return jours <= JOURS_ALERTE_EXPIRATION ? "bientot" : "valide";
}

export function etatValiditeTone(etat: EtatValidite): ApercuTone {
  switch (etat) {
    case "valide":
      return "pine";
    case "bientot":
      return "amber";
    case "expire":
      return "brake";
    default:
      return "muted";
  }
}

export function etatValiditeLabel(etat: EtatValidite): string {
  switch (etat) {
    case "valide":
      return "Valide";
    case "bientot":
      return "Expire bientôt";
    case "expire":
      return "Expiré";
    default:
      return "Non renseigné";
  }
}

export interface AlerteChauffeur {
  libelle: string;
  niveau: "bientot" | "expire";
}

/** Pièces et habilitations expirées ou expirant sous 30 jours. */
export function alertesChauffeur(
  chauffeur: Pick<
    Chauffeur,
    | "dateExpirationPasseport"
    | "dateExpirationPermis"
    | "dateExpirationVisa"
    | "habilitations"
  >,
  aujourdhui: Date
): AlerteChauffeur[] {
  const pieces: [string, string | null][] = [
    ["Permis de conduire", chauffeur.dateExpirationPermis],
    ["Passeport", chauffeur.dateExpirationPasseport],
    ["Visa", chauffeur.dateExpirationVisa],
    ...chauffeur.habilitations.map((h): [string, string | null] => [
      habilitationLabel(h.type),
      h.dateExpiration,
    ]),
  ];
  const alertes: AlerteChauffeur[] = [];
  for (const [nom, date] of pieces) {
    const etat = etatValidite(date, aujourdhui);
    if (etat === "expire" || etat === "bientot") {
      alertes.push({ libelle: nom, niveau: etat });
    }
  }
  return alertes;
}

/** Habilitations non expirées à la date (pour les pastilles de la liste). */
export function habilitationsValides(
  habilitations: readonly Habilitation[],
  aujourdhui: Date
): string[] {
  return habilitations
    .filter((h) => etatValidite(h.dateExpiration, aujourdhui) !== "expire")
    .map((h) => h.type);
}

// ─── Formulaire (brouillon ↔ API) ────────────────────────────────────────────

export interface HabilitationDraft {
  dateExpiration: string;
  dateObtention: string;
  reference: string;
  type: TypeHabilitation;
}

/** Brouillon du formulaire : texte vide = non renseigné. */
export interface ChauffeurDraft {
  adresse: string;
  categoriesPermis: CategoriePermis[];
  cin: string;
  dateDelivrancePasseport: string;
  dateDelivranceVisa: string;
  dateEmbauche: string;
  dateExpirationPasseport: string;
  dateExpirationPermis: string;
  dateExpirationVisa: string;
  dateNaissance: string;
  dateObtentionPermis: string;
  email: string;
  experienceAnnees: number | null;
  habilitations: HabilitationDraft[];
  lieuNaissance: string;
  matricule: string;
  nationalite: string;
  nom: string;
  numeroPasseport: string;
  numeroPermis: string;
  numeroVisa: string;
  paysDelivrancePasseport: string;
  paysVisa: string;
  prenom: string;
  siteRattachementId: string;
  soldeTempsConduiteHeures: number;
  specialisation: string;
  telephone: string;
  typeContrat: string;
  typeVisa: string;
}

export function emptyChauffeurDraft(): ChauffeurDraft {
  return {
    adresse: "",
    categoriesPermis: ["B", "C", "CE"],
    cin: "",
    dateDelivrancePasseport: "",
    dateDelivranceVisa: "",
    dateEmbauche: "",
    dateExpirationPasseport: "",
    dateExpirationPermis: "",
    dateExpirationVisa: "",
    dateNaissance: "",
    dateObtentionPermis: "",
    email: "",
    experienceAnnees: null,
    habilitations: [],
    lieuNaissance: "",
    matricule: "",
    nationalite: "",
    nom: "",
    numeroPasseport: "",
    numeroPermis: "",
    numeroVisa: "",
    paysDelivrancePasseport: "",
    paysVisa: "",
    prenom: "",
    siteRattachementId: "",
    soldeTempsConduiteHeures: 56,
    specialisation: "",
    telephone: "",
    typeContrat: "",
    typeVisa: "",
  };
}

function isCategoriePermis(valeur: string): valeur is CategoriePermis {
  return (CATEGORIES_PERMIS as readonly string[]).includes(valeur);
}

function isTypeHabilitation(valeur: string): valeur is TypeHabilitation {
  return (TYPES_HABILITATION as readonly string[]).includes(valeur);
}

export function chauffeurToDraft(chauffeur: Chauffeur): ChauffeurDraft {
  const texte = (valeur: string | null): string => valeur ?? "";
  return {
    adresse: texte(chauffeur.adresse),
    categoriesPermis: chauffeur.categoriesPermis.filter(isCategoriePermis),
    cin: texte(chauffeur.cin),
    dateDelivrancePasseport: texte(chauffeur.dateDelivrancePasseport),
    dateDelivranceVisa: texte(chauffeur.dateDelivranceVisa),
    dateEmbauche: texte(chauffeur.dateEmbauche),
    dateExpirationPasseport: texte(chauffeur.dateExpirationPasseport),
    dateExpirationPermis: texte(chauffeur.dateExpirationPermis),
    dateExpirationVisa: texte(chauffeur.dateExpirationVisa),
    dateNaissance: texte(chauffeur.dateNaissance),
    dateObtentionPermis: texte(chauffeur.dateObtentionPermis),
    email: texte(chauffeur.email),
    experienceAnnees: chauffeur.experienceAnnees,
    habilitations: chauffeur.habilitations
      .filter((h) => isTypeHabilitation(h.type))
      .map((h) => ({
        dateExpiration: h.dateExpiration,
        dateObtention: h.dateObtention,
        reference: h.reference,
        type: h.type as TypeHabilitation,
      })),
    lieuNaissance: texte(chauffeur.lieuNaissance),
    matricule: chauffeur.matricule,
    nationalite: texte(chauffeur.nationalite),
    nom: chauffeur.nom,
    numeroPasseport: texte(chauffeur.numeroPasseport),
    numeroPermis: texte(chauffeur.numeroPermis),
    numeroVisa: texte(chauffeur.numeroVisa),
    paysDelivrancePasseport: texte(chauffeur.paysDelivrancePasseport),
    paysVisa: texte(chauffeur.paysVisa),
    prenom: chauffeur.prenom,
    siteRattachementId: texte(chauffeur.siteRattachementId),
    soldeTempsConduiteHeures:
      Math.round((chauffeur.soldeTempsConduiteMinutes / 60) * 10) / 10,
    specialisation: texte(chauffeur.specialisation),
    telephone: texte(chauffeur.telephone),
    typeContrat: texte(chauffeur.typeContrat),
    typeVisa: texte(chauffeur.typeVisa),
  };
}

/** Partie administrative envoyée au backend (ProfilChauffeurRequest). */
export interface ProfilChauffeurWrite {
  adresse: string | null;
  categoriesPermis: CategoriePermis[];
  cin: string | null;
  dateDelivrancePasseport: string | null;
  dateDelivranceVisa: string | null;
  dateEmbauche: string | null;
  dateExpirationPasseport: string | null;
  dateExpirationPermis: string | null;
  dateExpirationVisa: string | null;
  dateNaissance: string | null;
  dateObtentionPermis: string | null;
  email: string | null;
  experienceAnnees: number | null;
  lieuNaissance: string | null;
  nationalite: string | null;
  numeroPasseport: string | null;
  numeroPermis: string | null;
  numeroVisa: string | null;
  paysDelivrancePasseport: string | null;
  paysVisa: string | null;
  siteRattachementId: string | null;
  specialisation: string | null;
  telephone: string | null;
  typeContrat: string | null;
  typeVisa: string | null;
}

export interface ChauffeurCreateWrite {
  habilitations: Habilitation[];
  matricule: string;
  nom: string;
  prenom: string;
  profil: ProfilChauffeurWrite;
  soldeTempsConduiteInitialMinutes: number;
}

export interface ChauffeurUpdateWrite {
  habilitations: Habilitation[];
  nom: string;
  prenom: string;
  profil: ProfilChauffeurWrite;
}

/** Texte vide ou option « aucun » d'une liste déroulante = non renseigné. */
function ouNull(valeur: string): string | null {
  const nettoye = valeur.trim();
  return isFieldSelectNone(nettoye) ? null : nettoye;
}

function draftToProfil(draft: ChauffeurDraft): ProfilChauffeurWrite {
  return {
    adresse: ouNull(draft.adresse),
    categoriesPermis: [...draft.categoriesPermis],
    cin: ouNull(draft.cin),
    dateDelivrancePasseport: ouNull(draft.dateDelivrancePasseport),
    dateDelivranceVisa: ouNull(draft.dateDelivranceVisa),
    dateEmbauche: ouNull(draft.dateEmbauche),
    dateExpirationPasseport: ouNull(draft.dateExpirationPasseport),
    dateExpirationPermis: ouNull(draft.dateExpirationPermis),
    dateExpirationVisa: ouNull(draft.dateExpirationVisa),
    dateNaissance: ouNull(draft.dateNaissance),
    dateObtentionPermis: ouNull(draft.dateObtentionPermis),
    email: ouNull(draft.email),
    experienceAnnees: draft.experienceAnnees,
    lieuNaissance: ouNull(draft.lieuNaissance),
    nationalite: ouNull(draft.nationalite),
    numeroPasseport: ouNull(draft.numeroPasseport),
    numeroPermis: ouNull(draft.numeroPermis),
    numeroVisa: ouNull(draft.numeroVisa),
    paysDelivrancePasseport: ouNull(draft.paysDelivrancePasseport),
    paysVisa: ouNull(draft.paysVisa),
    siteRattachementId: ouNull(draft.siteRattachementId),
    specialisation: ouNull(draft.specialisation),
    telephone: ouNull(draft.telephone),
    typeContrat: ouNull(draft.typeContrat),
    typeVisa: ouNull(draft.typeVisa),
  };
}

function draftToHabilitations(draft: ChauffeurDraft): Habilitation[] {
  return draft.habilitations.map((h) => ({
    dateExpiration: h.dateExpiration,
    dateObtention: h.dateObtention,
    reference: h.reference.trim(),
    type: h.type,
  }));
}

export function draftToCreate(draft: ChauffeurDraft): ChauffeurCreateWrite {
  return {
    habilitations: draftToHabilitations(draft),
    matricule: draft.matricule.trim().toUpperCase(),
    nom: draft.nom.trim(),
    prenom: draft.prenom.trim(),
    profil: draftToProfil(draft),
    soldeTempsConduiteInitialMinutes: Math.max(
      0,
      Math.round(draft.soldeTempsConduiteHeures * 60)
    ),
  };
}

export function draftToUpdate(draft: ChauffeurDraft): ChauffeurUpdateWrite {
  return {
    habilitations: draftToHabilitations(draft),
    nom: draft.nom.trim(),
    prenom: draft.prenom.trim(),
    profil: draftToProfil(draft),
  };
}

/** Message d'erreur pour une ligne d'habilitation incomplète ou incohérente. */
export function erreurHabilitation(h: HabilitationDraft): string | null {
  if (!h.reference.trim()) {
    return "La référence est obligatoire.";
  }
  if (!(h.dateObtention && h.dateExpiration)) {
    return "Les dates d'obtention et d'expiration sont obligatoires.";
  }
  if (h.dateExpiration <= h.dateObtention) {
    return "L'expiration doit suivre l'obtention.";
  }
  return null;
}
