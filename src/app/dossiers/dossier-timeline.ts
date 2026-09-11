import type { OpsTimelineEntry } from "../shared/ui/ops-timeline";
import {
  type Dossier,
  formatInstant,
  statutDossierLabel,
  typeSegmentLabel,
} from "./dossier";

interface SortableEntry extends OpsTimelineEntry {
  readonly sortKey: string | null;
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
  iso: string
): SortableEntry {
  return {
    at: formatInstant(iso),
    id,
    kind,
    label,
    sortKey: iso,
  };
}

/** Timeline from dossier segments only — no statut-history API in v1. */
export function dossierTimelineEntries(dossier: Dossier): OpsTimelineEntry[] {
  const entries: SortableEntry[] = [];

  for (const segment of dossier.segments) {
    const kindLabel = typeSegmentLabel(segment.type);
    entries.push(
      dated(
        `segment-${segment.ordre}-debut`,
        "planned",
        `${kindLabel} · ouverture fenêtre`,
        segment.fenetre.debut
      )
    );
    entries.push(
      dated(
        `segment-${segment.ordre}-fin`,
        "planned",
        `${kindLabel} · fermeture fenêtre`,
        segment.fenetre.fin
      )
    );
    if (segment.realiseLe) {
      entries.push(
        dated(
          `segment-${segment.ordre}-realise`,
          "actual",
          `${kindLabel} réalisé`,
          segment.realiseLe
        )
      );
    }
  }

  entries.push({
    at: null,
    detail: statutDossierLabel(dossier.statut),
    id: "state-statut",
    kind: "state",
    label: "Statut actuel",
    sortKey: null,
  });

  return sortEntries(entries);
}
