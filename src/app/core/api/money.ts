/** Matches `Money` in OpenAPI — runtime JSON uses a currency code string. */
export interface Money {
  devise: string;
  montant: number;
}

/** ISO 4217 code for Moroccan dirham (affiché « DH »). */
export const APP_CURRENCY_CODE = "MAD";

export function formatAmountDh(
  montant: number,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  const { maximumFractionDigits = 2, minimumFractionDigits = 0 } =
    options ?? {};
  return `${montant.toLocaleString("fr-FR", {
    maximumFractionDigits,
    minimumFractionDigits,
  })} DH`;
}

export function formatMoney(money: Money): string {
  return formatAmountDh(money.montant);
}

export function madMoney(montant: number): Money {
  return { devise: APP_CURRENCY_CODE, montant };
}

/** @deprecated Préférer {@link madMoney}. */
export function eurMoney(montant: number): Money {
  return madMoney(montant);
}
