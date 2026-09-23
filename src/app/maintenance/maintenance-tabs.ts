import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

import {
  ZardTabComponent,
  ZardTabGroupComponent,
} from "@/shared/components/tabs";

@Component({
  imports: [ZardTabComponent, ZardTabGroupComponent],
  selector: "app-maintenance-tabs",
  templateUrl: "./maintenance-tabs.html",
})
export class MaintenanceTabs {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly tabGroup = viewChild(ZardTabGroupComponent);

  constructor() {
    const syncActiveTab = () => {
      const group = this.tabGroup();
      if (!group) {
        return;
      }
      group.selectTabByIndex(this.indexFromUrl(this.router.url));
    };

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => syncActiveTab());

    afterNextRender(() => syncActiveTab());
  }

  protected onTabChange(event: { index: number }): void {
    const target = event.index === 1 ? "/maintenance/plans" : "/maintenance";
    const path = this.router.url.split("?")[0];
    if (path === target) {
      return;
    }
    void this.router.navigateByUrl(target);
  }

  private indexFromUrl(url: string): number {
    const path = url.split("?")[0];
    if (path === "/maintenance/plans" || path.startsWith("/maintenance/plans/")) {
      return 1;
    }
    return 0;
  }
}
