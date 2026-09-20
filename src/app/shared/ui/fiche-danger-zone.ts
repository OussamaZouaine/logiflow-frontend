import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/** Destructive or irreversible actions, visually separated from the main form. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-fiche-danger-zone",
  template: `
    <section class="fiche-danger-zone">
      <div>
        <h2 class="fiche-danger-zone__title">{{ title() }}</h2>
        @if (description()) {
        <p class="fiche-danger-zone__description">{{ description() }}</p>
        }
      </div>
      <ng-content />
    </section>
  `,
})
export class FicheDangerZone {
  readonly description = input<string>();
  readonly title = input.required<string>();
}
