import { Component, computed, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { DemoSessionService } from "../core/auth/demo-session";
import { roleLabel } from "../core/auth/role";

@Component({
  imports: [RouterLink],
  selector: "app-acces-refuse-page",
  templateUrl: "./acces-refuse-page.html",
})
export class AccesRefusePage {
  private readonly session = inject(DemoSessionService);
  private readonly router = inject(Router);

  protected readonly roleName = computed(() => {
    const current = this.session.session();
    const role = current?.roles[0];
    return role ? roleLabel(role) : "inconnu";
  });

  protected readonly login = computed(
    () => this.session.session()?.login ?? ""
  );

  protected readonly hasSession = computed(() => this.session.isSignedIn());

  protected async signOut(): Promise<void> {
    this.session.signOut();
    await this.router.navigateByUrl("/connexion");
  }
}
