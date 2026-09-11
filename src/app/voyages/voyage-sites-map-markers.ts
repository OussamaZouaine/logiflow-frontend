import type { Dossier } from "../dossiers/dossier";
import type { GeoMapMarker } from "../shared/ui/geo-markers-map";
import type { Site } from "../sites/site";
import { isValidLocalisation } from "../sites/site-localisation";
import type { Voyage } from "./voyage";

const SEGMENT_KIND_LABEL: Record<string, string> = {
  CHARGEMENT: "Chargement",
  DECHARGEMENT: "Déchargement",
};

/** Resolves unique geolocated sites linked to a voyage via its dossiers. */
export function voyageSiteMarkers(
  voyage: Voyage | null | undefined,
  dossiersById: ReadonlyMap<string, Dossier>,
  sitesById: ReadonlyMap<string, Site>
): GeoMapMarker[] {
  if (!voyage) {
    return [];
  }

  const seen = new Set<string>();
  const markers: GeoMapMarker[] = [];

  for (const dossierId of voyage.dossierIds) {
    const dossier = dossiersById.get(dossierId);
    if (!dossier) {
      continue;
    }
    for (const segment of dossier.segments) {
      if (seen.has(segment.siteId)) {
        continue;
      }
      const site = sitesById.get(segment.siteId);
      if (!site) {
        continue;
      }
      const { latitude, longitude } = site.localisation;
      if (!isValidLocalisation(latitude, longitude)) {
        continue;
      }
      seen.add(segment.siteId);
      const kindLabel = SEGMENT_KIND_LABEL[segment.type] ?? "Site";
      markers.push({
        id: site.id,
        label: `${kindLabel} · ${site.code} — ${site.libelle}`,
        latitude,
        longitude,
      });
    }
  }

  return markers;
}
