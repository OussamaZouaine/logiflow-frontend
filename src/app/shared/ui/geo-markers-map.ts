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

export interface GeoMapPathPoint {
  readonly latitude: number;
  readonly longitude: number;
}

const ROUTE_POLYLINE_COLOR = "#215544";

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
      overflow: hidden;
    }

    .map-host ::ng-deep .leaflet-container {
      border-radius: inherit;
    }

    :host ::ng-deep .leaflet-control-attribution {
      font-size: 0.65rem;
    }
  `,
  template: `
    <div
      #mapHost
      [attr.aria-label]="ariaLabel()"
      class="map-host surface-panel"
      role="application"
    ></div>
  `,
})
export class GeoMarkersMap implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly markers = input.required<readonly GeoMapMarker[]>();
  readonly path = input<readonly GeoMapPathPoint[]>([]);
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
      const path = this.path();
      const focusId = this.focusId();
      if (!this.mapReady()) {
        return;
      }
      this.renderMapContent(next, path);
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
    this.renderMapContent(this.markers(), this.path());
    this.focusMarker(this.focusId());

    requestAnimationFrame(() => {
      this.map?.invalidateSize();
      requestAnimationFrame(() => {
        this.map?.invalidateSize();
      });
    });
  }

  private renderMapContent(
    markers: readonly GeoMapMarker[],
    path: readonly GeoMapPathPoint[]
  ): void {
    if (!this.map) {
      return;
    }

    this.layer.clearLayers();
    this.markersById.clear();
    const boundsPoints: L.LatLngExpression[] = [];

    const routePoints = this.resolvePathPoints(path, markers);
    if (routePoints.length >= 2) {
      L.polyline(routePoints, {
        color: ROUTE_POLYLINE_COLOR,
        opacity: 0.88,
        weight: 4,
      }).addTo(this.layer);
      boundsPoints.push(...routePoints);
    }

    for (const marker of markers) {
      if (!isValidLocalisation(marker.latitude, marker.longitude)) {
        continue;
      }
      const latLng = L.latLng(marker.latitude, marker.longitude);
      boundsPoints.push(latLng);
      const leafletMarker = L.marker(latLng, { icon: GEO_MARKER_ICON }).bindPopup(
        marker.label
      );
      leafletMarker.addTo(this.layer);
      if (marker.id) {
        this.markersById.set(marker.id, leafletMarker);
      }
    }

    if (boundsPoints.length === 0) {
      this.map.setView(
        [
          DEFAULT_SITE_LOCALISATION.latitude,
          DEFAULT_SITE_LOCALISATION.longitude,
        ],
        SITE_MAP_ZOOM - 4
      );
      return;
    }

    if (boundsPoints.length === 1) {
      this.map.setView(boundsPoints[0], SITE_MAP_ZOOM - 2);
      return;
    }

    this.map.fitBounds(L.latLngBounds(boundsPoints), { padding: [36, 36] });
  }

  private resolvePathPoints(
    path: readonly GeoMapPathPoint[],
    markers: readonly GeoMapMarker[]
  ): L.LatLngExpression[] {
    const source =
      path.length >= 2
        ? path
        : markers.map((marker) => ({
            latitude: marker.latitude,
            longitude: marker.longitude,
          }));

    const points: L.LatLngExpression[] = [];
    for (const point of source) {
      if (!isValidLocalisation(point.latitude, point.longitude)) {
        continue;
      }
      points.push(L.latLng(point.latitude, point.longitude));
    }
    return points;
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
