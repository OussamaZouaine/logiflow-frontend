/**
 * Copilote conversationnel (chatbot) — contrat de /api/v1/ia/copilote/** côté Spring.
 * Les conversations sont stockées par le service IA ; Angular ne parle qu'à Spring.
 */

export type RoleMessage = "user" | "assistant";

export type StatutMessage = "complet" | "en_cours" | "interrompu" | "erreur";

export type StatutOutil = "debut" | "fin" | "erreur";

export interface SourceCopilote {
  id: string | null;
  reference: string;
  type: string;
}

export interface ConversationCopilote {
  creeLe: string;
  id: string;
  modifieLe: string;
  titre: string;
}

export interface MessageCopilote {
  contenu: string;
  creeLe: string;
  id: string;
  role: RoleMessage;
  sources: SourceCopilote[];
  statut: StatutMessage;
}

export interface ConversationCopiloteDetail extends ConversationCopilote {
  messages: MessageCopilote[];
}

/** Événements du flux SSE d'une réponse (voir docs/integration-ia.md côté backend). */
export type EvenementCopilote =
  | { nom: "meta"; donnees: { conversationId: string; messageId: string } }
  | {
      nom: "outil";
      donnees: { libelle: string; nom: string; statut: StatutOutil };
    }
  | { nom: "token"; donnees: { texte: string } }
  | { nom: "sources"; donnees: { sources: SourceCopilote[] } }
  | { nom: "titre"; donnees: { titre: string } }
  | { nom: "fin"; donnees: { messageId: string } }
  /** Battement pendant que le LLM réfléchit (garde la connexion ouverte). */
  | { nom: "attente"; donnees: Record<string, never> }
  | { nom: "erreur"; donnees: { code: string; message: string } };

export const COPILOTE_QUESTION_MAX_LENGTH = 2000;

export const COPILOTE_SUGGESTIONS = [
  "Quels voyages sont en cours ?",
  "Quels véhicules sont disponibles ?",
  "Quelle est la consommation de carburant de la flotte ce mois-ci ?",
  "Quels dossiers sont en transit ?",
] as const;

export function canSubmitCopiloteQuestion(question: string): boolean {
  const trimmed = question.trim();
  return trimmed.length > 0 && trimmed.length <= COPILOTE_QUESTION_MAX_LENGTH;
}

const ROUTES_SOURCES: Readonly<Record<string, string>> = {
  CLIENT: "/clients",
  COMMANDE: "/commandes",
  DOSSIER: "/dossiers",
  REMORQUE: "/remorques",
  VEHICULE: "/vehicules",
  VOYAGE: "/voyages",
};

/** Page de détail d'une source citée, ou null si l'entité n'a pas de fiche. */
export function routeSource(source: SourceCopilote): string | null {
  const base = ROUTES_SOURCES[source.type];
  if (!(base && source.id)) {
    return null;
  }
  return `${base}/${encodeURIComponent(source.id)}`;
}

const LIBELLES_SOURCES: Readonly<Record<string, string>> = {
  CHAUFFEUR: "Chauffeur",
  CLIENT: "Client",
  COMMANDE: "Commande",
  DOSSIER: "Dossier",
  REMORQUE: "Remorque",
  VEHICULE: "Véhicule",
  VOYAGE: "Voyage",
};

export function libelleTypeSource(type: string): string {
  return LIBELLES_SOURCES[type] ?? type;
}
