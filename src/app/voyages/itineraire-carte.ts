import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import type { ItinerairePoint } from "../ia/itineraire";
import { ItineraireApi } from "../ia/itineraire-api";
import {
  type GeoMapMarker,
  type GeoMapPathPoint,
  GeoMarkersMap,
} from "../shared/ui/geo-markers-map";

/** Arrêt affiché sur la carte, dans l'ordre de passage. */
export interface ArretCarte {
  readonly id?: string;
  readonly latitude: number;
  readonly libelle: string;
  readonly longitude: number;
}

/**
 * Carte d'un itinéraire : un marqueur numéroté par arrêt et le tracé routier OSRM (via Spring).
 * Si le tracé est indisponible, les arrêts sont reliés en ligne droite.
 */
@Component({
  imports: [GeoMarkersMap],
  selector: "app-itineraire-carte",
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <app-geo-markers-map
      [ariaLabel]="ariaLabel()"
      [markers]="marqueurs()"
      [path]="trace()"
      [style.height]="hauteur()"
    />
  `,
})
export class ItineraireCarte {
  private readonly itineraireApi = inject(ItineraireApi);

  readonly arrets = input.required<readonly ArretCarte[]>();
  readonly ariaLabel = input("Carte de l'itinéraire");
  readonly hauteur = input("18rem");

  private readonly geometrie = signal<readonly GeoMapPathPoint[] | null>(null);

  protected readonly marqueurs = computed<readonly GeoMapMarker[]>(() =>
    this.arrets().map((arret, index) => ({
      id: arret.id ?? `${index}`,
      label: `${index + 1}. ${arret.libelle}`,
      latitude: arret.latitude,
      longitude: arret.longitude,
    }))
  );

  protected readonly trace = computed<readonly GeoMapPathPoint[]>(
    () =>
      this.geometrie() ??
      this.arrets().map(({ latitude, longitude }) => ({ latitude, longitude }))
  );

  constructor() {
    effect((onCleanup) => {
      const points: ItinerairePoint[] = this.arrets().map((arret) => ({
        latitude: arret.latitude,
        libelle: arret.libelle,
        longitude: arret.longitude,
      }));
      this.geometrie.set(null);
      if (points.length < 2) {
        return;
      }
      let annule = false;
      onCleanup(() => {
        annule = true;
      });
      this.itineraireApi
        .calculerGeometrie(points)
        .then((resultat) => {
          if (!annule && resultat.geometrie.length > 1) {
            this.geometrie.set(resultat.geometrie);
          }
        })
        .catch(() => {
          // Tracé routier indisponible : les lignes droites entre arrêts suffisent.
        });
    });
  }
}
