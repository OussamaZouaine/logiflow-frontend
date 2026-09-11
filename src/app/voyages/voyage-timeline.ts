import type { OpsTimelineEntry } from "../shared/ui/ops-timeline";
import {
  type EvenementVoyage,
  formatInstant,
  statutVoyageLabel,
  typeEtapeLabel,
  typeEvenementLabel,
  type Voyage,
} from "./voyage";

interface SortableEntry extends OpsTimelineEntry {
  readonly sortKey: string | null;
}

function roleLabel(role: "TITULAIRE" | "RENFORT"): string {
  return role === "TITULAIRE" ? "Titulaire" : "Renfort";
}

function sortEntries(entries: SortableEntry[]): OpsTimelineEntry[] {
  return [...entries]
    .sort((left, right) => {
      if (left.sortKey === null && right.sortKey === null) {
        return 0;
      }
      if (left.sortKey === null) {
        return 1;
      }
      if (right.sortKey === null) {
        return -1;
      }
      return left.sortKey.localeCompare(right.sortKey);
    })
    .map(({ sortKey: _sortKey, ...entry }) => entry);
}

function dated(
  id: string,
  kind: OpsTimelineEntry["kind"],
  label: string,
  iso: string,
  detail?: string | null
): SortableEntry {
  return {
    at: formatInstant(iso),
    detail: detail ?? null,
    id,
    kind,
    label,
    sortKey: iso,
  };
}

/** Chronological ops timeline from voyage payload + événements (no new API). */
export function voyageTimelineEntries(
  voyage: Voyage,
  evenements: readonly EvenementVoyage[]
): OpsTimelineEntry[] {
  const entries: SortableEntry[] = [
    dated("planned-depart", "planned", "Départ prévu", voyage.departPrevu),
    dated(
      "planned-arrivee",
      "planned",
      "Arrivée prévue",
      voyage.arriveePrevue
    ),
  ];

  for (const etape of voyage.trajet.etapes) {
    entries.push(
      dated(
        `etape-${etape.ordre}-eta`,
        "planned",
        `${typeEtapeLabel(etape.type)} (ETA)`,
        etape.eta
      )
    );
    if (etape.etd) {
      entries.push(
        dated(
          `etape-${etape.ordre}-etd`,
          "planned",
          `${typeEtapeLabel(etape.type)} (ETD)`,
          etape.etd
        )
      );
    }
  }

  for (const [index, affectation] of voyage.affectations.entries()) {
    entries.push(
      dated(
        `affectation-${index}`,
        "actual",
        `Affectation · ${roleLabel(affectation.role)}`,
        affectation.dateAffectation,
        `Chauffeur ${affectation.chauffeurId.slice(0, 8)}…`
      )
    );
  }

  for (const evenement of evenements) {
    if (evenement.type === "POSITION") {
      continue;
    }
    entries.push(
      dated(
        `evenement-${evenement.id}`,
        "actual",
        typeEvenementLabel(evenement.type),
        evenement.horodatage,
        evenement.commentaire
      )
    );
  }

  entries.push({
    at: null,
    detail: statutVoyageLabel(voyage.statut),
    id: "state-statut",
    kind: "state",
    label: "Statut actuel",
    sortKey: null,
  });

  return sortEntries(entries);
}
