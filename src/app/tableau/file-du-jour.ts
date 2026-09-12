import type { Commande } from "../commandes/commande";
import type { WorkDestinationId } from "../core/nav/work-destination";
import type { Dossier } from "../dossiers/dossier";
import type { Vehicule } from "../vehicules/vehicule";
import type { Voyage } from "../voyages/voyage";
import type { ApercuTone } from "./apercu";

export const FILE_DU_JOUR_SECTION_ID = "file-du-jour";

export interface FileDuJourItem {
  count: number;
  detail: string;
  id: string;
  path: string;
  title: string;
  tone: ApercuTone;
}

export interface FileDuJourSummary {
  categoryCount: number;
  topTone: ApercuTone | null;
  totalCount: number;
}

export interface FileDuJourInput {
  allowedIds: ReadonlySet<WorkDestinationId>;
  commandes: readonly Pick<Commande, "statut">[] | null;
  dossiers: readonly Pick<Dossier, "statut">[] | null;
  vehicules: readonly Pick<Vehicule, "statut">[] | null;
  voyages: readonly Pick<Voyage, "statut">[] | null;
}

const TONE_RANK: Record<ApercuTone, number> = {
  brake: 0,
  amber: 1,
  ink: 2,
  pine: 3,
  muted: 4,
};

function countBy<T extends string>(
  values: readonly T[],
  match: ReadonlySet<T>
): number {
  let total = 0;
  for (const value of values) {
    if (match.has(value)) {
      total += 1;
    }
  }
  return total;
}

function item(
  id: string,
  title: string,
  detail: string,
  path: string,
  tone: ApercuTone,
  count: number
): FileDuJourItem | null {
  if (count <= 0) {
    return null;
  }
  return { count, detail, id, path, title, tone };
}

/**
 * Builds the role-scoped “file du jour”: exceptions first, then work waiting.
 * Aggregates from list pages already loaded for the Aperçu — no extra API.
 */
export function buildFileDuJour(input: FileDuJourInput): FileDuJourItem[] {
  const items: FileDuJourItem[] = [];

  if (input.allowedIds.has("dossiers") && input.dossiers) {
    const dossiers = input.dossiers;
    const incident = item(
      "dossiers-incident",
      "Dossiers en incident",
      "À traiter en priorité",
      "/dossiers",
      "brake",
      countBy(dossiers.map((d) => d.statut), new Set(["INCIDENT"]))
    );
    const aPlanifier = item(
      "dossiers-creer",
      "Dossiers à planifier",
      "Statut Créé — pas encore sur un voyage",
      "/dossiers",
      "muted",
      countBy(dossiers.map((d) => d.statut), new Set(["CREE"]))
    );
    const enCours = item(
      "dossiers-en-cours",
      "Dossiers en cours",
      "Chargement, transit ou livraison",
      "/dossiers",
      "pine",
      countBy(
        dossiers.map((d) => d.statut),
        new Set(["EN_CHARGEMENT", "CHARGE", "EN_TRANSIT", "EN_LIVRAISON"])
      )
    );
    if (incident) items.push(incident);
    if (aPlanifier) items.push(aPlanifier);
    if (enCours) items.push(enCours);
  }

  if (input.allowedIds.has("voyages") && input.voyages) {
    const voyages = input.voyages;
    const enCours = item(
      "voyages-en-cours",
      "Voyages en cours",
      "Exécution terrain",
      "/voyages",
      "pine",
      countBy(voyages.map((v) => v.statut), new Set(["EN_COURS"]))
    );
    const aDemarrer = item(
      "voyages-a-demarrer",
      "Voyages à démarrer",
      "Planifiés ou affectés",
      "/voyages",
      "amber",
      countBy(voyages.map((v) => v.statut), new Set(["PLANIFIE", "AFFECTE"]))
    );
    if (enCours) items.push(enCours);
    if (aDemarrer) items.push(aDemarrer);
  }

  if (input.allowedIds.has("commandes") && input.commandes) {
    const aConfirmer = item(
      "commandes-recue",
      "Commandes à confirmer",
      "Reçues — pas encore confirmées",
      "/commandes",
      "amber",
      countBy(
        input.commandes.map((c) => c.statut),
        new Set(["RECUE"])
      )
    );
    if (aConfirmer) items.push(aConfirmer);
  }

  if (input.allowedIds.has("vehicules") && input.vehicules) {
    const vehicules = input.vehicules;
    const bloque = item(
      "vehicules-bloque",
      "Véhicules indisponibles",
      "Immobilisés ou hors service",
      "/vehicules",
      "brake",
      countBy(
        vehicules.map((v) => v.statut),
        new Set(["IMMOBILISE", "HORS_SERVICE"])
      )
    );
    const atelier = item(
      "vehicules-atelier",
      "Véhicules en maintenance",
      "Indisponibles pour l’exploitation",
      "/vehicules",
      "amber",
      countBy(vehicules.map((v) => v.statut), new Set(["EN_MAINTENANCE"]))
    );
    if (bloque) items.push(bloque);
    if (atelier) items.push(atelier);
  }

  return items.sort((a, b) => {
    const toneDiff = TONE_RANK[a.tone] - TONE_RANK[b.tone];
    if (toneDiff !== 0) {
      return toneDiff;
    }
    return b.count - a.count;
  });
}

/** Aggregate counts for the utility-bar badge. */
export function fileDuJourSummary(
  items: readonly FileDuJourItem[]
): FileDuJourSummary {
  if (items.length === 0) {
    return { categoryCount: 0, topTone: null, totalCount: 0 };
  }
  return {
    categoryCount: items.length,
    topTone: items[0]?.tone ?? null,
    totalCount: items.reduce((sum, item) => sum + item.count, 0),
  };
}

/** Accessible label for the shell file-du-jour shortcut. */
export function fileDuJourBadgeLabel(summary: FileDuJourSummary): string {
  if (summary.totalCount <= 0) {
    return "File du jour";
  }
  const plural = summary.totalCount === 1 ? "" : "s";
  return `${summary.totalCount} élément${plural} dans la file du jour — ouvrir le tableau de bord`;
}
