import { Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DemoSessionService } from "../core/auth/demo-session";
import { roleLabel } from "../core/auth/role";
import { destinationsForRoles } from "../core/nav/work-destination";

@Component({
  imports: [RouterLink],
  selector: "app-tableau-de-bord-page",
  templateUrl: "./tableau-de-bord-page.html",
})
export class TableauDeBordPage {
  private readonly session = inject(DemoSessionService);

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
}
