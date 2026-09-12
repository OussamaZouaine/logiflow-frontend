import { httpResource } from "@angular/common/http";
import { Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FicheHeader } from "../shared/ui/fiche-header";
import { ToastService } from "../shared/ui/toast";
import { OpsTimeline } from "../shared/ui/ops-timeline";
import { StatutChip } from "../shared/ui/statut-chip";
import { dossierStatutTone } from "../tableau/apercu";
import { environment } from "../../environments/environment";
import { httpErrorMessage } from "../core/api/http-error";
import type { PageResponse } from "../core/api/page-response";
import { DemoSessionService } from "../core/auth/demo-session";
import {
  DOSSIERS_PLAN_ROLES,
  VOYAGES_ALLOWED_ROLES,
} from "../core/auth/role";
import {
  commandeLabelFromLookup,
  type Commande,
} from "../commandes/commande";
import { statutVoyageLabel } from "../voyages/voyage";
import {
  formatWindow,
  manualNextStatuts,
  siteLabelFromLookup,
  statutDossierLabel,
  type Dossier,
  type DossierLookupSite,
  type StatutDossier,
  typeSegmentLabel,
  typeTransportLabel,
} from "./dossier";
import { DossierApi } from "./dossier-api";
import { dossierTimelineEntries } from "./dossier-timeline";

const SITE_LOOKUP_PAGE_SIZE = 50;
const COMMANDE_LOOKUP_PAGE_SIZE = 50;

interface VoyageLink {
  id: string;
  reference: string;
}

@Component({
  imports: [RouterLink, FicheHeader, OpsTimeline, StatutChip],
  selector: "app-dossier-detail-page",
  templateUrl: "./dossier-detail-page.html",
})
export class DossierDetailPage {
  private readonly api = inject(DossierApi);
  private readonly toast = inject(ToastService);
  private readonly session = inject(DemoSessionService);

  readonly id = input.required<string>();

  protected readonly formatWindow = formatWindow;
  protected readonly manualNextStatuts = manualNextStatuts;
  protected readonly statutDossierLabel = statutDossierLabel;
  protected readonly dossierStatutTone = dossierStatutTone;
  protected readonly statutVoyageLabel = statutVoyageLabel;
  protected readonly typeSegmentLabel = typeSegmentLabel;
  protected readonly typeTransportLabel = typeTransportLabel;

  protected readonly canPlan = computed(() =>
    this.session.hasAnyRole(DOSSIERS_PLAN_ROLES)
  );

  protected readonly canOpenVoyages = computed(() =>
    this.session.hasAnyRole(VOYAGES_ALLOWED_ROLES)
  );

  protected readonly statutError = signal<string | null>(null);

  protected readonly dossier = httpResource<Dossier>(() => ({
    url: `${environment.apiBaseUrl}/dossiers/${this.id()}`,
  }));

  protected readonly voyagesPorteurs = httpResource<
    PageResponse<VoyageLink>
  >(() => {
    const dossier = this.dossier.value();
    if (!dossier || dossier.statut !== "PLANIFIE") {
      return undefined;
    }
    return {
      params: { dossierId: this.id() },
      url: `${environment.apiBaseUrl}/voyages`,
    };
  });

  protected readonly commandes = httpResource<PageResponse<Commande>>(() => ({
    params: { page: 0, q: "", size: COMMANDE_LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/commandes`,
  }));

  protected readonly sites = httpResource<PageResponse<DossierLookupSite>>(() => ({
    params: { page: 0, q: "", size: SITE_LOOKUP_PAGE_SIZE },
    url: `${environment.apiBaseUrl}/sites`,
  }));

  protected readonly sitesById = computed(() => {
    const map = new Map<string, DossierLookupSite>();
    for (const site of this.sites.value()?.content ?? []) {
      map.set(site.id, site);
    }
    return map;
  });

  protected readonly commandesById = computed(() => {
    const map = new Map<string, Commande>();
    for (const commande of this.commandes.value()?.content ?? []) {
      map.set(commande.id, commande);
    }
    return map;
  });

  protected readonly voyagesPorteursList = computed(
    () => this.voyagesPorteurs.value()?.content ?? []
  );

  protected readonly timelineEntries = computed(() => {
    const dossier = this.dossier.value();
    if (!dossier) {
      return [];
    }
    return dossierTimelineEntries(dossier);
  });

  protected readonly loadError = computed(() =>
    httpErrorMessage(this.dossier.error())
  );

  protected commandeLabel(commandeId: string): string {
    return commandeLabelFromLookup(commandeId, this.commandesById());
  }

  protected siteLabel(siteId: string): string {
    return siteLabelFromLookup(siteId, this.sitesById());
  }

  protected async changerStatut(valeur: StatutDossier): Promise<void> {
    this.statutError.set(null);
    try {
      await this.api.changerStatut(this.id(), valeur);
      this.dossier.reload();
      this.toast.success("Statut du dossier mis à jour.");
    } catch (error) {
      this.statutError.set(httpErrorMessage(error));
    }
  }
}
