import { Component, inject, signal } from "@angular/core";
import { FormField, form, required, submit } from "@angular/forms/signals";
import { Router } from "@angular/router";
import {
  DEMO_IDENTITIES,
  DEMO_PASSWORD,
  type DemoIdentity,
} from "../core/auth/demo-identity";
import { DemoSessionService } from "../core/auth/demo-session";
import { roleLabel } from "../core/auth/role";

@Component({
  imports: [FormField],
  selector: "app-sign-in-page",
  styleUrl: "./sign-in-page.css",
  templateUrl: "./sign-in-page.html",
})
export class SignInPage {
  private readonly session = inject(DemoSessionService);
  private readonly router = inject(Router);

  protected readonly identities = DEMO_IDENTITIES;
  protected readonly demoPassword = DEMO_PASSWORD;
  protected readonly roleLabel = roleLabel;
  protected readonly authError = signal<string | null>(null);

  protected readonly credentials = signal({
    login: "",
    password: "",
  });

  protected readonly signInForm = form(this.credentials, (path) => {
    required(path.login, { message: "L'identifiant est obligatoire." });
    required(path.password, { message: "Le mot de passe est obligatoire." });
  });

  protected fillIdentity(identity: DemoIdentity): void {
    this.authError.set(null);
    this.credentials.set({
      login: identity.login,
      password: DEMO_PASSWORD,
    });
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    this.authError.set(null);
    await submit(this.signInForm, async () => {
      const { login, password } = this.credentials();
      const accepted = this.session.signIn(login, password);
      if (!accepted) {
        this.authError.set("Identifiant ou mot de passe incorrect.");
        return;
      }
      await this.router.navigateByUrl("/");
    });
  }

  protected firstError(errors: readonly { message?: string }[]): string | null {
    const message = errors[0]?.message;
    return message ?? null;
  }
}
