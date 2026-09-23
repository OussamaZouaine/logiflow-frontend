import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { DemoSessionService } from "../core/auth/demo-session";
import { SITES_ALLOWED_ROLES } from "../core/auth/role";

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: "app-carburant-tabs",
  templateUrl: "./carburant-tabs.html",
})
export class CarburantTabs {
  private readonly session = inject(DemoSessionService);

  protected readonly showStations = computed(() => {
    const roles = this.session.session()?.roles ?? [];
    return roles.some((role) => SITES_ALLOWED_ROLES.includes(role));
  });
}
