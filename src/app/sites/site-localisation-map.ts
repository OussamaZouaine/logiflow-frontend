import {
  type AfterViewInit,
  Component,
  DestroyRef,
  type ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
// biome-ignore lint/performance/noNamespaceImport: Leaflet is published as a single CommonJS namespace.
import * as L from "leaflet";
import {
  DEFAULT_SITE_LOCALISATION,
  isValidLocalisation,
  roundLocalisationCoordinate,
  SITE_MAP_ZOOM,
} from "./site-localisation";

const SITE_MARKER_ICON = L.icon({
  iconAnchor: [12, 41],
  iconRetinaUrl: "/assets/leaflet/marker-icon-2x.png",
  iconSize: [25, 41],
  iconUrl: "/assets/leaflet/marker-icon.png",
  popupAnchor: [1, -34],
  shadowAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowUrl: "/assets/leaflet/marker-shadow.png",
});

export interface SiteLocalisationCoordinates {
  latitude: number;
  longitude: number;
}

@Component({
  selector: "app-site-localisation-map",
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .map-host {
      height: min(28rem, 50vh);
      min-height: 16rem;
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
  templateUrl: "./site-localisation-map.html",
})
export class SiteLocalisationMap implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly latitude = input.required<number>();
  readonly longitude = input.required<number>();
  readonly showHeader = input(true);
  readonly coordinatesChange = output<SiteLocalisationCoordinates>();

  private readonly mapHost =
    viewChild.required<ElementRef<HTMLElement>>("mapHost");

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private readonly mapReady = signal(false);
  private syncingFromMap = false;

  constructor() {
    effect(() => {
      const latitude = this.latitude();
      const longitude = this.longitude();
      if (!this.mapReady() || this.syncingFromMap) {
        return;
      }
      if (!isValidLocalisation(latitude, longitude)) {
        return;
      }
      this.syncMarkerFromInputs(latitude, longitude);
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.destroyRef.onDestroy(() => {
      this.map?.remove();
      this.map = null;
      this.marker = null;
      this.mapReady.set(false);
    });
  }

  private initMap(): void {
    const host = this.mapHost().nativeElement;
    const latitude = this.latitude();
    const longitude = this.longitude();
    const center = isValidLocalisation(latitude, longitude)
      ? L.latLng(latitude, longitude)
      : L.latLng(
          DEFAULT_SITE_LOCALISATION.latitude,
          DEFAULT_SITE_LOCALISATION.longitude
        );

    this.map = L.map(host, {
      center,
      scrollWheelZoom: true,
      zoom: SITE_MAP_ZOOM,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker(center, {
      draggable: true,
      icon: SITE_MARKER_ICON,
    }).addTo(this.map);
    this.marker.on("dragend", () => this.onMarkerMoved());
    this.map.on("click", (event: L.LeafletMouseEvent) => {
      this.marker?.setLatLng(event.latlng);
      this.onMarkerMoved();
    });

    this.mapReady.set(true);
    if (isValidLocalisation(latitude, longitude)) {
      this.syncMarkerFromInputs(latitude, longitude);
    }

    // Lazy routes and flex layout settle after first paint; Leaflet needs a remeasure.
    requestAnimationFrame(() => {
      this.map?.invalidateSize();
      requestAnimationFrame(() => {
        this.map?.invalidateSize();
      });
    });
  }

  private onMarkerMoved(): void {
    if (!this.marker) {
      return;
    }
    const { lat, lng } = this.marker.getLatLng();
    this.syncingFromMap = true;
    this.coordinatesChange.emit({
      latitude: roundLocalisationCoordinate(lat),
      longitude: roundLocalisationCoordinate(lng),
    });
    queueMicrotask(() => {
      this.syncingFromMap = false;
    });
  }

  private syncMarkerFromInputs(latitude: number, longitude: number): void {
    if (!(this.map && this.marker)) {
      return;
    }

    const next = L.latLng(latitude, longitude);
    const current = this.marker.getLatLng();
    const moved =
      roundLocalisationCoordinate(current.lat) !== latitude ||
      roundLocalisationCoordinate(current.lng) !== longitude;

    if (moved) {
      this.marker.setLatLng(next);
      this.map.panTo(next);
    }
  }
}
