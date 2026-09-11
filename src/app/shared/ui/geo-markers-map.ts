import {
  type AfterViewInit,
  Component,
  DestroyRef,
  type ElementRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
// biome-ignore lint/performance/noNamespaceImport: Leaflet is published as a single CommonJS namespace.
import * as L from "leaflet";
import {
  DEFAULT_SITE_LOCALISATION,
  isValidLocalisation,
  SITE_MAP_ZOOM,
} from "../../sites/site-localisation";

const GEO_MARKER_ICON = L.icon({
  iconAnchor: [12, 41],
  iconRetinaUrl: "/assets/leaflet/marker-icon-2x.png",
  iconSize: [25, 41],
  iconUrl: "/assets/leaflet/marker-icon.png",
  popupAnchor: [1, -34],
  shadowAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowUrl: "/assets/leaflet/marker-shadow.png",
});

export interface GeoMapMarker {
  readonly id?: string;
  readonly label: string;
  readonly latitude: number;
  readonly longitude: number;
}

@Component({
  selector: "app-geo-markers-map",
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .map-host {
      height: 100%;
      min-height: 20rem;
      width: 100%;
      z-index: 0;
    }

    :host ::ng-deep .leaflet-control-attribution {
      font-size: 0.65rem;
    }
  `,
  template: `
    <div
      #mapHost
      [attr.aria-label]="ariaLabel()"
      class="map-host border border-line bg-surface"
      role="application"
    ></div>
  `,
})
export class GeoMarkersMap implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly markers = input.required<readonly GeoMapMarker[]>();
  readonly focusId = input<string | null>(null);
  readonly ariaLabel = input("Carte");

  private readonly mapHost =
    viewChild.required<ElementRef<HTMLElement>>("mapHost");

  private map: L.Map | null = null;
  private readonly layer = L.layerGroup();
  private readonly markersById = new Map<string, L.Marker>();
  private readonly mapReady = signal(false);

  constructor() {
    effect(() => {
      const next = this.markers();
      const focusId = this.focusId();
      if (!this.mapReady()) {
        return;
      }
      this.renderMarkers(next);
      this.focusMarker(focusId);
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.destroyRef.onDestroy(() => {
      this.map?.remove();
      this.map = null;
      this.markersById.clear();
      this.mapReady.set(false);
    });
  }

  private initMap(): void {
    const host = this.mapHost().nativeElement;
    this.map = L.map(host, {
      center: L.latLng(
        DEFAULT_SITE_LOCALISATION.latitude,
        DEFAULT_SITE_LOCALISATION.longitude
      ),
      scrollWheelZoom: true,
      zoom: SITE_MAP_ZOOM - 4,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.layer.addTo(this.map);
    this.mapReady.set(true);
    this.renderMarkers(this.markers());
    this.focusMarker(this.focusId());

    requestAnimationFrame(() => {
      this.map?.invalidateSize();
      requestAnimationFrame(() => {
        this.map?.invalidateSize();
      });
    });
  }

  private renderMarkers(markers: readonly GeoMapMarker[]): void {
    if (!this.map) {
      return;
    }

    this.layer.clearLayers();
    this.markersById.clear();
    const points: L.LatLngExpression[] = [];

    for (const marker of markers) {
      if (!isValidLocalisation(marker.latitude, marker.longitude)) {
        continue;
      }
      const latLng = L.latLng(marker.latitude, marker.longitude);
      points.push(latLng);
      const leafletMarker = L.marker(latLng, { icon: GEO_MARKER_ICON }).bindPopup(
        marker.label
      );
      leafletMarker.addTo(this.layer);
      if (marker.id) {
        this.markersById.set(marker.id, leafletMarker);
      }
    }

    if (points.length === 0) {
      this.map.setView(
        [
          DEFAULT_SITE_LOCALISATION.latitude,
          DEFAULT_SITE_LOCALISATION.longitude,
        ],
        SITE_MAP_ZOOM - 4
      );
      return;
    }

    if (points.length === 1) {
      this.map.setView(points[0], SITE_MAP_ZOOM - 2);
      return;
    }

    this.map.fitBounds(L.latLngBounds(points), { padding: [36, 36] });
  }

  private focusMarker(focusId: string | null): void {
    if (!(this.map && focusId)) {
      return;
    }
    const marker = this.markersById.get(focusId);
    if (!marker) {
      return;
    }
    const latLng = marker.getLatLng();
    this.map.panTo(latLng);
    marker.openPopup();
  }
}
