import { Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  type WorkDestinationId,
  workDestination,
} from "../core/nav/work-destination";

@Component({
  imports: [RouterLink],
  selector: "app-module-placeholder-page",
  template: `
    <div class="flex max-w-lg flex-col gap-4">
      <p
        class="text-[0.7rem] font-medium tracking-[0.18em] text-pine uppercase"
      >
        {{ destination().section }}
      </p>
      <h1
        class="font-display text-balance text-3xl font-medium tracking-tight text-ink"
      >
        {{ destination().label }}
      </h1>
      <p class="text-pretty text-sm leading-relaxed text-muted">
        Liste Angular à brancher. L'API
        <code class="font-mono text-ink">{{ destination().apiHint }}</code>
        existe déjà côté backend.
      </p>
      <a
        class="pressable pressable-border mt-2 w-fit border border-line px-4 py-2 text-sm font-medium text-ink"
        routerLink="/"
      >
        Retour au tableau de bord
      </a>
    </div>
  `,
})
export class ModulePlaceholderPage {
  readonly destinationId = input.required<WorkDestinationId>();

  protected readonly destination = computed(() =>
    workDestination(this.destinationId())
  );
}
