import { Component, computed, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { DemoSessionService } from "../core/auth/demo-session";
import { roleLabel } from "../core/auth/role";
import { destinationsForRoles } from "../core/nav/work-destination";

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: "app-signed-in-shell",
  templateUrl: "./signed-in-shell.html",
})
export class SignedInShell {
  private readonly session = inject(DemoSessionService);
  private readonly router = inject(Router);

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

  protected async signOut(): Promise<void> {
    this.session.signOut();
    await this.router.navigateByUrl("/connexion");
  }
}
