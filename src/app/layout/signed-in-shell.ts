import { CdkScrollable } from "@angular/cdk/scrolling";
import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideBuilding2,
  lucideClipboardList,
  lucideContainer,
  lucideFolderOpen,
  lucideFuel,
  lucideInbox,
  lucideLayoutDashboard,
  lucideMapPin,
  lucideMenu,
  lucidePackage,
  lucideRoute,
  lucideSearch,
  lucideTruck,
  lucideUsers,
  lucideWrench,
  lucideX,
} from "@ng-icons/lucide";
import { filter } from "rxjs";
import { DemoSessionService } from "../core/auth/demo-session";
import { roleLabel } from "../core/auth/role";
import { DESTINATION_NAV_ICON, TABLEAU_NAV_ICON } from "../core/nav/nav-icon";
import type { ApercuTone } from "../tableau/apercu";
import {
  FILE_DU_JOUR_SECTION_ID,
  fileDuJourBadgeLabel,
} from "../tableau/file-du-jour";
import { FileDuJourStore } from "../tableau/file-du-jour-store";
import {
  destinationsForRoles,
  type WorkDestinationId,
} from "../core/nav/work-destination";
import { StatutChip, type StatutTone } from "../shared/ui/statut-chip";
import { ToastHost } from "../shared/ui/toast";
import { CommandPaletteService } from "./command-palette.service";
import { CopilotePanel } from "./copilote-panel";
import { ShellBreadcrumbComponent } from "./shell-breadcrumb";

@Component({
  imports: [
    CdkScrollable,
    NgIcon,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ShellBreadcrumbComponent,
    ToastHost,
    CopilotePanel,
    StatutChip,
  ],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideClipboardList,
      lucideContainer,
      lucideFolderOpen,
      lucideFuel,
      lucideInbox,
      lucideLayoutDashboard,
      lucideMapPin,
      lucideMenu,
      lucidePackage,
      lucideRoute,
      lucideSearch,
      lucideTruck,
      lucideUsers,
      lucideWrench,
      lucideX,
    }),
  ],
  selector: "app-signed-in-shell",
  styleUrl: "./signed-in-shell.css",
  templateUrl: "./signed-in-shell.html",
})
export class SignedInShell {
  private readonly session = inject(DemoSessionService);
  private readonly fileDuJourStore = inject(FileDuJourStore);
  private readonly commandPalette = inject(CommandPaletteService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mobileNavOpen = signal(false);
  protected readonly tableauIcon = TABLEAU_NAV_ICON;

  protected readonly login = computed(
    () => this.session.session()?.login ?? ""
  );

  protected readonly roleName = computed(() => {
    const role = this.session.session()?.roles[0];
    return role ? roleLabel(role) : "";
  });

  protected readonly navItems = computed(() =>
    destinationsForRoles(this.session.session()?.roles ?? [])
  );

  protected readonly fileDuJourSectionId = FILE_DU_JOUR_SECTION_ID;

  protected readonly showFileDuJourBadge = computed(
    () =>
      !this.fileDuJourStore.loading() &&
      this.fileDuJourStore.summary().totalCount > 0
  );

  protected readonly fileDuJourBadgeCount = computed(
    () => this.fileDuJourStore.summary().totalCount
  );

  protected readonly fileDuJourBadgeTone = computed((): StatutTone => {
    const tone: ApercuTone | null = this.fileDuJourStore.summary().topTone;
    return tone ?? "muted";
  });

  protected readonly fileDuJourBadgeAriaLabel = computed(() =>
    fileDuJourBadgeLabel(this.fileDuJourStore.summary())
  );

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.mobileNavOpen.set(false);
      });
  }

  protected iconFor(id: WorkDestinationId): string {
    return DESTINATION_NAV_ICON[id];
  }

  protected openMobileNav(): void {
    this.mobileNavOpen.set(true);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  protected openCommandPalette(): void {
    this.commandPalette.open();
  }

  protected async signOut(): Promise<void> {
    this.session.signOut();
    await this.router.navigateByUrl("/connexion");
  }

  @HostListener("document:keydown", ["$event"])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") {
      return;
    }
    event.preventDefault();
    this.openCommandPalette();
  }
}
