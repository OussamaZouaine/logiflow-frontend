export interface Habilitation {
  dateExpiration: string;
  dateObtention: string;
  reference: string;
  type: string;
}

export interface Chauffeur {
  adresse: string | null;
  categoriePermis: string | null;
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

export function formatChauffeurNomComplet(
  nom: string,
  prenom: string
): string {
  return `${prenom.trim()} ${nom.trim()}`.trim();
}

export function formatChauffeurLabel(
  chauffeur: Pick<Chauffeur, "matricule" | "nom" | "prenom">
): string {
  return `${chauffeur.matricule} — ${formatChauffeurNomComplet(chauffeur.nom, chauffeur.prenom)}`;
}

export function chauffeurLabelFromLookup(
  chauffeurId: string,
  chauffeursById: ReadonlyMap<string, Pick<Chauffeur, "matricule" | "nom" | "prenom">>
): string {
  const chauffeur = chauffeursById.get(chauffeurId);
  return chauffeur
    ? formatChauffeurLabel(chauffeur)
    : chauffeurId;
}
