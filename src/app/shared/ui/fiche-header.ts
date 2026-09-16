import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

/**
 * Sticky header for module fiches: back link + projected title/meta.
 * Sticks below the utility bar while the main pane scrolls.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "sticky top-0 z-10 -mx-6 mb-6 block border-b border-line bg-canvas/95 px-6 py-3 backdrop-blur-sm",
    role: "banner",
  },
  imports: [RouterLink],
  selector: "app-fiche-header",
  template: `
    <a
      [routerLink]="listLink()"
      class="btn-back pressable"
    >
      ← {{ listLabel() }}
    </a>
    <div class="mt-3">
      <ng-content />
    </div>
  `,
})
export class FicheHeader {
  readonly listLink = input.required<string>();
  readonly listLabel = input.required<string>();
}
