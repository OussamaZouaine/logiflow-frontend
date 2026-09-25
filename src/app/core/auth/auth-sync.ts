import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AUTH_BROADCAST_CHANNEL } from "./auth-storage";
import { SessionUtilisateur } from "./session";
import { environment } from "../../../environments/environment";

/** Déconnexion synchronisée entre onglets (mode Keycloak). */
@Injectable({ providedIn: "root" })
export class AuthSyncService {
  private readonly session = inject(SessionUtilisateur);
  private readonly router = inject(Router);

  init(): void {
    if (environment.auth.mode !== "keycloak") {
      return;
    }
    if (typeof BroadcastChannel === "undefined") {
      return;
    }
    const canal = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
    canal.onmessage = (event: MessageEvent) => {
      if (event.data !== "logout") {
        return;
      }
      void this.router.navigateByUrl("/connexion");
    };
  }
}
