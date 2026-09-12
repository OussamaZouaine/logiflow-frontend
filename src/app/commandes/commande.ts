export const STATUT_COMMANDES = ["RECUE", "CONFIRMEE", "ANNULEE"] as const;
export type StatutCommande = (typeof STATUT_COMMANDES)[number];

export interface Money {
  devise: string;
  montant: number;
}

export interface LigneCommande {
  marchandiseId: string;
  nbColis: number;
  poidsKg: number;
  volumeM3: number;
}

export interface Commande {
  clientId: string;
  dateSouhaitee: string;
  id: string;
  lignes: LigneCommande[];
  prixNegocie: Money;
  reference: string;
  statut: StatutCommande;
}

export interface CommandeWrite {
  clientId: string;
  dateSouhaitee: string;
  lignes: LigneCommande[];
  prixNegocie: Money;
}

export interface LigneCommandeDraft {
  marchandiseId: string;
  nbColis: number;
  poidsKg: number;
  volumeM3: number;
}

export interface Client {
  actif: boolean;
  code: string;
  id: string;
  raisonSociale: string;
}

export interface CommandeDraft {
  clientCode: string;
  clientId: string;
  clientRaisonSociale: string;
  dateSouhaitee: string;
  lignes: LigneCommandeDraft[];
  montant: number;
  nouveauClient: boolean;
}

export function emptyLigneCommandeDraft(): LigneCommandeDraft {
  return {
    marchandiseId: "",
    nbColis: 12,
    poidsKg: 1200,
    volumeM3: 8,
  };
}

export function emptyCommandeDraft(): CommandeDraft {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return {
    clientCode: "",
    clientId: "",
    clientRaisonSociale: "",
    dateSouhaitee: toDateInput(date),
    lignes: [emptyLigneCommandeDraft()],
    montant: 2000,
    nouveauClient: true,
  };
}

export function validateLignesCommande(
  lignes: LigneCommandeDraft[]
): string | null {
  if (lignes.length === 0) {
    return "Ajoutez au moins une ligne de marchandise.";
  }
  for (const [index, ligne] of lignes.entries()) {
    if (!ligne.marchandiseId.trim()) {
      return `Ligne ${index + 1} : choisissez une marchandise du catalogue.`;
    }
    if (ligne.poidsKg < 0) {
      return `Ligne ${index + 1} : le poids ne peut pas être négatif.`;
    }
    if (ligne.volumeM3 < 0) {
      return `Ligne ${index + 1} : le volume ne peut pas être négatif.`;
    }
    if (ligne.nbColis < 0) {
      return `Ligne ${index + 1} : le nombre de colis ne peut pas être négatif.`;
    }
  }
  return null;
}

export function draftToWrite(
  draft: CommandeDraft,
  clientId: string
): CommandeWrite {
  return {
    clientId,
    dateSouhaitee: draft.dateSouhaitee,
    lignes: draft.lignes.map((ligne) => ({
      marchandiseId: ligne.marchandiseId.trim(),
      nbColis: ligne.nbColis,
      poidsKg: ligne.poidsKg,
      volumeM3: ligne.volumeM3,
    })),
    prixNegocie: {
      devise: "EUR",
      montant: draft.montant,
    },
  };
}

export function statutCommandeLabel(statut: StatutCommande): string {
  switch (statut) {
    case "RECUE":
      return "Reçue";
    case "CONFIRMEE":
      return "Confirmée";
    case "ANNULEE":
      return "Annulée";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function formatMoney(money: Money): string {
  return `${money.montant.toLocaleString("fr-FR")} ${money.devise}`;
}

export function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("fr-FR");
}

export function formatCommandeLabel(
  commande: Pick<Commande, "reference" | "dateSouhaitee">
): string {
  return `${commande.reference} — ${formatDate(commande.dateSouhaitee)}`;
}

export function commandeLabelFromLookup(
  commandeId: string,
  commandesById: ReadonlyMap<string, Pick<Commande, "reference" | "dateSouhaitee">>
): string {
  const commande = commandesById.get(commandeId);
  return commande ? formatCommandeLabel(commande) : commandeId;
}

export function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
