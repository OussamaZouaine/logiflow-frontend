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

/**
 * GET /api/v1/ia/copilote/etat. `llm` : UP, DOWN, CLE_ABSENTE, CLE_INVALIDE,
 * MODELE_ABSENT ou INCONNU ; `fournisseur` : hôte de l'API (ex. api.groq.com).
 */
export interface EtatCopilote {
  /**
   * Renseigné côté client uniquement : false quand l'appel à Spring lui-même a
   * échoué (backend arrêté, ou version sans /etat) — à distinguer d'un service
   * IA hors ligne signalé par Spring.
   */
  backendJoignable?: boolean;
  base: string;
  fournisseur?: string | null;
  llm: string;
  modele: string | null;
  operationnel: boolean;
  serviceIa: boolean;
}

export type NiveauEtat = "verification" | "ok" | "degrade" | "hors_ligne";

export interface EtatAffiche {
  detail: string;
  libelle: string;
  niveau: NiveauEtat;
}

const ETAT_VERIFICATION: EtatAffiche = {
  detail: "Vérification de la disponibilité du moteur IA…",
  libelle: "Vérification…",
  niveau: "verification",
};

/** Messages pour un LLM non opérationnel (le service IA, lui, répond). */
function etatLlm(
  llm: string,
  modele: string,
  fournisseur: string
): EtatAffiche {
  switch (llm) {
    case "CLE_ABSENTE":
      return {
        detail:
          "Aucune clé API configurée pour le fournisseur IA : renseignez LLM_API_KEY dans logiflow-ai-service/.env puis redémarrez le service IA.",
        libelle: "Clé API manquante",
        niveau: "hors_ligne",
      };
    case "CLE_INVALIDE":
      return {
        detail: `La clé API est refusée par ${fournisseur} : vérifiez LLM_API_KEY dans logiflow-ai-service/.env.`,
        libelle: "Clé API invalide",
        niveau: "hors_ligne",
      };
    case "MODELE_ABSENT":
      return {
        detail: `Le modèle ${modele} n'existe pas chez ${fournisseur} : corrigez LLM_MODEL.`,
        libelle: "Modèle introuvable",
        niveau: "degrade",
      };
    default:
      return {
        detail: `Le fournisseur IA (${fournisseur}) ne répond pas : vérifiez la connexion Internet.`,
        libelle: "Fournisseur IA injoignable",
        niveau: "hors_ligne",
      };
  }
}

/** Traduit l'état technique en libellé pour la pastille du panneau. */
export function afficherEtat(etat: EtatCopilote | null): EtatAffiche {
  if (!etat) {
    return ETAT_VERIFICATION;
  }
  const modele = etat.modele ?? "modèle inconnu";
  const fournisseur = etat.fournisseur ?? "fournisseur inconnu";
  if (etat.backendJoignable === false) {
    return {
      detail:
        "Le backend LogiFlow ne répond pas à /api/v1/ia/copilote/etat : vérifiez qu'il est démarré et à jour (redémarrez-le après une mise à jour).",
      libelle: "Backend injoignable",
      niveau: "hors_ligne",
    };
  }
  if (etat.operationnel) {
    return {
      detail: `Copilote opérationnel : ${modele} via ${fournisseur}.`,
      libelle: "En ligne",
      niveau: "ok",
    };
  }
  if (!etat.serviceIa) {
    return {
      detail:
        "Le service IA (logiflow-ai-service, port 8000) ne répond pas : démarrez-le.",
      libelle: "Service IA hors ligne",
      niveau: "hors_ligne",
    };
  }
  if (etat.llm !== "UP") {
    return etatLlm(etat.llm, modele, fournisseur);
  }
  return {
    detail:
      "La base du service IA est indisponible : l'historique ne peut pas être enregistré.",
    libelle: "Base IA indisponible",
    niveau: "degrade",
  };
}

const FORMAT_HEURE = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});
const FORMAT_JOUR = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

const MINUTE_MS = 60_000;
const HEURE_MS = 60 * MINUTE_MS;
const JOUR_MS = 24 * HEURE_MS;

export function formatHeure(iso: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : FORMAT_HEURE.format(date);
}

/** « à l'instant », « il y a 5 min », « il y a 3 h », « hier », sinon « 12 sept. ». */
export function formatDateRelative(iso: string, maintenantMs: number): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const ecart = maintenantMs - date.getTime();
  if (ecart < MINUTE_MS) {
    return "à l'instant";
  }
  if (ecart < HEURE_MS) {
    return `il y a ${Math.floor(ecart / MINUTE_MS)} min`;
  }
  if (ecart < JOUR_MS) {
    return `il y a ${Math.floor(ecart / HEURE_MS)} h`;
  }
  if (ecart < 2 * JOUR_MS) {
    return "hier";
  }
  return FORMAT_JOUR.format(date);
}

/** Durée écoulée lisible : « 8 s », « 1 min 05 s ». */
export function formatDuree(ms: number): string {
  const secondes = Math.max(0, Math.floor(ms / 1000));
  if (secondes < 60) {
    return `${secondes} s`;
  }
  const minutes = Math.floor(secondes / 60);
  return `${minutes} min ${String(secondes % 60).padStart(2, "0")} s`;
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
  CHAUFFEUR: "/chauffeurs",
  CLIENT: "/clients",
  COMMANDE: "/commandes",
  DOSSIER: "/dossiers",
  ORDRE_TRAVAIL: "/maintenance/ordres-travail",
  REMORQUE: "/remorques",
  SINISTRE: "/maintenance/sinistres",
  VEHICULE: "/vehicules",
  VOYAGE: "/voyages",
};

/** Page de détail d'une source citée, ou null si l'entité n'a pas de fiche. */
export function routeSource(source: SourceCopilote): string | null {
  if (source.type === "PLANIFICATION") {
    return "/voyages/nouveau";
  }
  if (source.type === "COUTS_MAINTENANCE") {
    return "/maintenance/couts";
  }
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
  COUTS_MAINTENANCE: "Coûts de maintenance",
  DOSSIER: "Dossier",
  ORDRE_TRAVAIL: "Ordre de travail",
  PLANIFICATION: "Planification",
  REMORQUE: "Remorque",
  SINISTRE: "Sinistre",
  VEHICULE: "Véhicule",
  VOYAGE: "Voyage",
};

export function libelleTypeSource(type: string): string {
  return LIBELLES_SOURCES[type] ?? type;
}
