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
  lucideClipboardList,
  lucideFolderOpen,
  lucideLayoutDashboard,
  lucideMapPin,
  lucideMenu,
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
import {
  filterPaletteItems,
  type PaletteItem,
  paletteItemsForRoles,
} from "../core/nav/palette-items";
import {
  destinationsForRoles,
  type WorkDestinationId,
} from "../core/nav/work-destination";

@Component({
  imports: [NgIcon, RouterLink, RouterLinkActive, RouterOutlet],
  providers: [
    provideIcons({
      lucideClipboardList,
      lucideFolderOpen,
      lucideLayoutDashboard,
      lucideMapPin,
      lucideMenu,
      lucideRoute,
      lucideSearch,
      lucideTruck,
      lucideUsers,
      lucideWrench,
      lucideX,
    }),
  ],
  selector: "app-signed-in-shell",
  templateUrl: "./signed-in-shell.html",
})
export class SignedInShell {
  private readonly session = inject(DemoSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private jumpBlurTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

  protected readonly mobileNavOpen = signal(false);
  protected readonly jumpOpen = signal(false);
  protected readonly jumpQuery = signal("");
  protected readonly jumpActiveIndex = signal(0);
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

  protected readonly jumpTargets = computed((): PaletteItem[] =>
    paletteItemsForRoles(this.session.session()?.roles ?? [])
  );

  protected readonly filteredJumpTargets = computed(() =>
    filterPaletteItems(this.jumpTargets(), this.jumpQuery())
  );

  /** Section label when the previous filtered item belongs to another section. */
  protected jumpSectionLabel(
    items: readonly PaletteItem[],
    index: number
  ): string | null {
    const item = items[index];
    if (!item) {
      return null;
    }
    if (index === 0) {
      return item.section;
    }
    const previous = items[index - 1];
    if (!previous || previous.section === item.section) {
      return null;
    }
    return item.section;
  }

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
        this.closeJump();
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

  protected openJump(): void {
    this.clearJumpBlurTimer();
    this.jumpOpen.set(true);
    this.jumpActiveIndex.set(0);
  }

  protected closeJump(): void {
    this.clearJumpBlurTimer();
    this.jumpOpen.set(false);
    this.jumpQuery.set("");
    this.jumpActiveIndex.set(0);
  }

  protected onJumpBlur(): void {
    this.clearJumpBlurTimer();
    this.jumpBlurTimer = globalThis.setTimeout(() => {
      this.closeJump();
    }, 150);
  }

  protected onJumpListPointerDown(event: Event): void {
    event.preventDefault();
    this.clearJumpBlurTimer();
  }

  private clearJumpBlurTimer(): void {
    if (this.jumpBlurTimer !== null) {
      globalThis.clearTimeout(this.jumpBlurTimer);
      this.jumpBlurTimer = null;
    }
  }

  protected onJumpInput(event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.jumpQuery.set(target.value);
    this.jumpOpen.set(true);
    this.jumpActiveIndex.set(0);
  }

  protected onJumpKeydown(event: KeyboardEvent): void {
    const targets = this.filteredJumpTargets();
    if (targets.length === 0) {
      return;
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        this.jumpActiveIndex.update((index) => (index + 1) % targets.length);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        this.jumpActiveIndex.update(
          (index) => (index - 1 + targets.length) % targets.length
        );
        break;
      }
      case "Enter": {
        event.preventDefault();
        const target = targets[this.jumpActiveIndex()];
        if (target) {
          void this.goTo(target.path);
        }
        break;
      }
      case "Escape": {
        event.preventDefault();
        this.closeJump();
        (event.target as HTMLElement | null)?.blur();
        break;
      }
      default:
        break;
    }
  }

  protected async goTo(path: string): Promise<void> {
    this.closeJump();
    await this.router.navigateByUrl(path);
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
    const input = document.getElementById(
      "app-shell-jump"
    ) as HTMLInputElement | null;
    input?.focus();
    this.openJump();
  }
}
