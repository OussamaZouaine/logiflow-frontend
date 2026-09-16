/** Matches `Money` in OpenAPI — runtime JSON uses a currency code string. */
export interface Money {
  devise: string;
  montant: number;
}

export function formatMoney(money: Money): string {
  return `${money.montant.toLocaleString("fr-FR")} ${money.devise}`;
}

export function eurMoney(montant: number): Money {
  return { devise: "EUR", montant };
}
