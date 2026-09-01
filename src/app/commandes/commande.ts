export const STATUT_COMMANDES = ["RECUE", "CONFIRMEE", "ANNULEE"] as const;
export type StatutCommande = (typeof STATUT_COMMANDES)[number];

export interface Money {
  devise: string;
  montant: number;
}

export interface Commande {
  clientId: string;
  dateSouhaitee: string;
  id: string;
  prixNegocie: Money;
  reference: string;
  statut: StatutCommande;
}

export interface CommandeWrite {
  clientId: string;
  dateSouhaitee: string;
  prixNegocie: Money;
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
  montant: number;
  nouveauClient: boolean;
}

export function emptyCommandeDraft(): CommandeDraft {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return {
    clientCode: "",
    clientId: "",
    clientRaisonSociale: "",
    dateSouhaitee: toDateInput(date),
    montant: 2000,
    nouveauClient: true,
  };
}

export function draftToWrite(
  draft: CommandeDraft,
  clientId: string
): CommandeWrite {
  return {
    clientId,
    dateSouhaitee: draft.dateSouhaitee,
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

export function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
