import { httpResource } from "@angular/common/http";
import { Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { environment } from "../../environments/environment";
import type { Commande } from "../commandes/commande";
import type { PageResponse } from "../core/api/page-response";
import { DemoSessionService } from "../core/auth/demo-session";
import { roleLabel } from "../core/auth/role";
import { destinationsForRoles } from "../core/nav/work-destination";
import type { Dossier } from "../dossiers/dossier";
import { StatutChip } from "../shared/ui/statut-chip";
import type { Site } from "../sites/site";
import type { Utilisateur } from "../utilisateurs/utilisateur";
import type { Vehicule } from "../vehicules/vehicule";
import type { Voyage } from "../voyages/voyage";
import {
  APERCU_CHART_PAGE_SIZE,
  APERCU_COUNT_PAGE_SIZE,
  type ApercuCountableId,
  type ApercuTone,
  apercuDestinations,
  apercuToneClass,
  commandeStatutSlices,
  dossierStatutSlices,
  type StatutSlice,
  shouldShowStatutBreakdown,
  vehiculeStatutSlices,
  voyageStatutSlices,
} from "./apercu";
import { buildFileDuJour, type FileDuJourItem } from "./file-du-jour";

export interface ApercuTile {
  count: number | null;
  label: string;
  loading: boolean;
  path: string;
  section: string;
  slices: StatutSlice[] | null;
}

@Component({
  imports: [RouterLink, StatutChip],
  selector: "app-tableau-de-bord-page",
  styleUrl: "./tableau-de-bord-page.css",
  templateUrl: "./tableau-de-bord-page.html",
})
export class TableauDeBordPage {
  private readonly session = inject(DemoSessionService);

  protected readonly apercuToneClass = apercuToneClass;

  protected readonly login = computed(
    () => this.session.session()?.login ?? ""
  );

  protected readonly roleName = computed(() => {
    const role = this.session.session()?.roles[0];
    return role ? roleLabel(role) : "";
  });

  protected readonly destinations = computed(() =>
    destinationsForRoles(this.session.session()?.roles ?? [])
  );

  protected readonly countableDestinations = computed(() =>
    apercuDestinations(this.destinations())
  );

  protected readonly allowedIds = computed(
    () => new Set(this.destinations().map((destination) => destination.id))
  );

  protected readonly sites = httpResource<PageResponse<Site>>(() =>
    this.listRequest("sites", APERCU_COUNT_PAGE_SIZE)
  );

  protected readonly vehicules = httpResource<PageResponse<Vehicule>>(() =>
    this.listRequest("vehicules", APERCU_CHART_PAGE_SIZE)
  );

  protected readonly voyages = httpResource<PageResponse<Voyage>>(() =>
    this.listRequest("voyages", APERCU_CHART_PAGE_SIZE)
  );

  protected readonly commandes = httpResource<PageResponse<Commande>>(() =>
    this.listRequest("commandes", APERCU_CHART_PAGE_SIZE)
  );

  protected readonly dossiers = httpResource<PageResponse<Dossier>>(() =>
    this.listRequest("dossiers", APERCU_CHART_PAGE_SIZE)
  );

  protected readonly utilisateurs = httpResource<PageResponse<Utilisateur>>(
    () => this.listRequest("utilisateurs", APERCU_COUNT_PAGE_SIZE)
  );

  protected readonly fileDuJour = computed((): FileDuJourItem[] =>
    buildFileDuJour({
      allowedIds: this.allowedIds(),
      commandes: this.commandes.value()?.content ?? null,
      dossiers: this.dossiers.value()?.content ?? null,
      vehicules: this.vehicules.value()?.content ?? null,
      voyages: this.voyages.value()?.content ?? null,
    })
  );

  protected readonly fileDuJourLoading = computed(() => {
    const ids = this.allowedIds();
    return (
      (ids.has("commandes") && this.commandes.isLoading()) ||
      (ids.has("dossiers") && this.dossiers.isLoading()) ||
      (ids.has("vehicules") && this.vehicules.isLoading()) ||
      (ids.has("voyages") && this.voyages.isLoading())
    );
  });

  protected readonly tiles = computed((): ApercuTile[] =>
    this.countableDestinations().map((destination) => {
      switch (destination.id) {
        case "sites":
          return this.countTile(destination, this.sites);
        case "vehicules":
          return this.chartTile(
            destination,
            this.vehicules,
            vehiculeStatutSlices
          );
        case "voyages":
          return this.chartTile(destination, this.voyages, voyageStatutSlices);
        case "commandes":
          return this.chartTile(
            destination,
            this.commandes,
            commandeStatutSlices
          );
        case "dossiers":
          return this.chartTile(
            destination,
            this.dossiers,
            dossierStatutSlices
          );
        case "utilisateurs":
          return this.countTile(destination, this.utilisateurs);
        default: {
          const _exhaustive: never = destination.id;
          return _exhaustive;
        }
      }
    })
  );

  protected tileAriaLabel(tile: ApercuTile): string {
    if (tile.loading) {
      return `${tile.label}, chargement. Ouvrir le module.`;
    }
    if (tile.count === null) {
      return `${tile.label}, indisponible. Ouvrir le module.`;
    }
    return `${tile.label}, ${tile.count}. Ouvrir le module.`;
  }

  protected priorityLabel(tone: ApercuTone): string {
    switch (tone) {
      case "brake":
        return "Priorité";
      case "ink":
        return "Attention";
      case "pine":
        return "En cours";
      case "muted":
        return "À faire";
      default: {
        const _exhaustive: never = tone;
        return _exhaustive;
      }
    }
  }

  private listRequest(
    id: ApercuCountableId,
    size: number
  ):
    | { params: { page: number; q?: string; size: number }; url: string }
    | undefined {
    if (
      !this.countableDestinations().some((destination) => destination.id === id)
    ) {
      return undefined;
    }
    const needsQuery =
      id === "sites" || id === "vehicules" || id === "utilisateurs";
    return {
      params: needsQuery ? { page: 0, q: "", size } : { page: 0, size },
      url: `${environment.apiBaseUrl}/${id}`,
    };
  }

  private countTile(
    destination: { label: string; path: string; section: string },
    resource: {
      isLoading: () => boolean;
      value: () => PageResponse<unknown> | undefined;
    }
  ): ApercuTile {
    const page = resource.value();
    return {
      count: page === undefined ? null : page.totalElements,
      label: destination.label,
      loading: resource.isLoading(),
      path: destination.path,
      section: destination.section,
      slices: null,
    };
  }

  private chartTile<T>(
    destination: { label: string; path: string; section: string },
    resource: {
      isLoading: () => boolean;
      value: () => PageResponse<T> | undefined;
    },
    slicesOf: (records: readonly T[]) => StatutSlice[]
  ): ApercuTile {
    const page = resource.value();
    return {
      count: page === undefined ? null : page.totalElements,
      label: destination.label,
      loading: resource.isLoading(),
      path: destination.path,
      section: destination.section,
      slices:
        page && shouldShowStatutBreakdown(page)
          ? slicesOf(page.content)
          : null,
    };
  }
}
