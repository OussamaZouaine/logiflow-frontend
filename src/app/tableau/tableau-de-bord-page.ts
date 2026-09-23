import { httpResource } from "@angular/common/http";
import { Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideChevronRight,
	lucideClipboardList,
	lucideContainer,
	lucideFolderOpen,
	lucideInbox,
	lucideMapPin,
	lucidePackage,
	lucideRoute,
	lucideTruck,
	lucideUsers,
	lucideWrench,
} from "@ng-icons/lucide";
import { environment } from "../../environments/environment";
import type { PageResponse } from "../core/api/page-response";
import { DemoSessionService } from "../core/auth/demo-session";
import { roleLabel } from "../core/auth/role";
import { destinationsForRoles } from "../core/nav/work-destination";
import type { OrdreTravail } from "../maintenance/ordre-travail";
import type { Site } from "../sites/site";
import type { Utilisateur } from "../utilisateurs/utilisateur";
import {
	APERCU_CHART_PAGE_SIZE,
	APERCU_COUNT_PAGE_SIZE,
	type ApercuCountableId,
	apercuApiPath,
	apercuDestinations,
	apercuToneBorderClass,
	apercuToneClass,
	commandeStatutSlices,
	dossierStatutSlices,
	priseStatutSlices,
	type StatutSlice,
	shouldShowStatutBreakdown,
	vehiculeStatutSlices,
	voyageStatutSlices,
} from "./apercu";
import type { PriseCarburant } from "../carburant/prise-carburant";
import { FileDuJourStore } from "./file-du-jour-store";
import {
	fileDuJourIcon,
	fileDuJourToneCounts,
	groupFileDuJourByTone,
} from "./file-du-jour";

export interface ApercuTile {
	count: number | null;
	label: string;
	loading: boolean;
	path: string;
	section: string;
	slices: StatutSlice[] | null;
}

@Component({
	imports: [NgIcon, RouterLink],
	providers: [
		provideIcons({
			lucideChevronRight,
			lucideClipboardList,
			lucideContainer,
			lucideFolderOpen,
			lucideInbox,
			lucideMapPin,
			lucidePackage,
			lucideRoute,
			lucideTruck,
			lucideUsers,
			lucideWrench,
		}),
	],
	selector: "app-tableau-de-bord-page",
	styleUrl: "./tableau-de-bord-page.css",
	templateUrl: "./tableau-de-bord-page.html",
})
export class TableauDeBordPage {
	private readonly session = inject(DemoSessionService);
	private readonly fileDuJourStore = inject(FileDuJourStore);

	protected readonly apercuToneBorderClass = apercuToneBorderClass;
	protected readonly apercuToneClass = apercuToneClass;
	protected readonly fileDuJourIcon = fileDuJourIcon;

	protected readonly login = computed(
		() => this.session.session()?.login ?? "",
	);

	protected readonly roleName = computed(() => {
		const role = this.session.session()?.roles[0];
		return role ? roleLabel(role) : "";
	});

	protected readonly destinations = computed(() =>
		destinationsForRoles(this.session.session()?.roles ?? []),
	);

	protected readonly countableDestinations = computed(() =>
		apercuDestinations(this.destinations()),
	);

	protected readonly sites = httpResource<PageResponse<Site>>(() =>
		this.listRequest("sites", APERCU_COUNT_PAGE_SIZE),
	);

	protected readonly vehicules = this.fileDuJourStore.vehicules;

	protected readonly voyages = this.fileDuJourStore.voyages;

	protected readonly commandes = this.fileDuJourStore.commandes;

	protected readonly dossiers = this.fileDuJourStore.dossiers;

	protected readonly utilisateurs = httpResource<PageResponse<Utilisateur>>(
		() => this.listRequest("utilisateurs", APERCU_COUNT_PAGE_SIZE),
	);

	protected readonly ordresTravail = httpResource<PageResponse<OrdreTravail>>(
		() => this.listRequest("maintenance", APERCU_COUNT_PAGE_SIZE),
	);

	protected readonly prisesCarburant = httpResource<
		PageResponse<PriseCarburant>
	>(() => this.listRequest("carburant", APERCU_CHART_PAGE_SIZE));

	protected readonly fileDuJour = this.fileDuJourStore.items;

	protected readonly fileDuJourLoading = this.fileDuJourStore.loading;

	protected readonly fileDuJourSummary = this.fileDuJourStore.summary;

	protected readonly fileDuJourTiers = computed(() =>
		groupFileDuJourByTone(this.fileDuJour()),
	);

	protected readonly fileDuJourToneCounts = computed(() =>
		fileDuJourToneCounts(this.fileDuJour()),
	);

	protected readonly tiles = computed((): ApercuTile[] =>
		this.countableDestinations().map((destination) => {
			switch (destination.id) {
				case "sites":
					return this.countTile(destination, this.sites);
				case "vehicules":
					return this.chartTile(
						destination,
						this.vehicules,
						vehiculeStatutSlices,
					);
				case "voyages":
					return this.chartTile(destination, this.voyages, voyageStatutSlices);
				case "commandes":
					return this.chartTile(
						destination,
						this.commandes,
						commandeStatutSlices,
					);
				case "dossiers":
					return this.chartTile(
						destination,
						this.dossiers,
						dossierStatutSlices,
					);
				case "carburant":
					return this.chartTile(
						destination,
						this.prisesCarburant,
						priseStatutSlices,
					);
				case "maintenance":
					return this.countTile(destination, this.ordresTravail);
				case "utilisateurs":
					return this.countTile(destination, this.utilisateurs);
				default: {
					const _exhaustive: never = destination.id;
					return _exhaustive;
				}
			}
		}),
	);

	protected fileDuJourSummaryAriaLabel(): string {
		const summary = this.fileDuJourSummary();
		if (summary.totalCount <= 0) {
			return "";
		}
		const plural = summary.totalCount === 1 ? "" : "s";
		return `${summary.totalCount} élément${plural} à traiter`;
	}

	protected tileAriaLabel(tile: ApercuTile): string {
		if (tile.loading) {
			return `${tile.label}, chargement. Ouvrir le module.`;
		}
		if (tile.count === null) {
			return `${tile.label}, indisponible. Ouvrir le module.`;
		}
		return `${tile.label}, ${tile.count}. Ouvrir le module.`;
	}

	private listRequest(
		id: ApercuCountableId,
		size: number,
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
			url: `${environment.apiBaseUrl}/${apercuApiPath(id)}`,
		};
	}

	private countTile(
		destination: { label: string; path: string; section: string },
		resource: {
			isLoading: () => boolean;
			value: () => PageResponse<unknown> | undefined;
		},
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
		slicesOf: (records: readonly T[]) => StatutSlice[],
	): ApercuTile {
		const page = resource.value();
		return {
			count: page === undefined ? null : page.totalElements,
			label: destination.label,
			loading: resource.isLoading(),
			path: destination.path,
			section: destination.section,
			slices:
				page && shouldShowStatutBreakdown(page) ? slicesOf(page.content) : null,
		};
	}
}
