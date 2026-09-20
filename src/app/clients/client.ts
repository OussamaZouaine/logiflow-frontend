/** Client tel que renvoyé par l'API (`ClientResponse`). */
export interface Client {
  actif: boolean;
  code: string;
  id: string;
  raisonSociale: string;
}

/** Corps de création client, calqué sur `ClientRequest`. */
export interface ClientWrite {
  code: string;
  raisonSociale: string;
}

export interface ClientDraft {
  code: string;
  raisonSociale: string;
}

export function emptyClientDraft(): ClientDraft {
  return {
    code: "",
    raisonSociale: "",
  };
}

export function draftToWrite(draft: ClientDraft): ClientWrite {
  return {
    code: draft.code.trim(),
    raisonSociale: draft.raisonSociale.trim(),
  };
}

export function formatClientLabel(
  client: Pick<Client, "code" | "raisonSociale">
): string {
  return `${client.code} — ${client.raisonSociale}`;
}
