import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/** Primary key + projected status chips on fiche headers. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "fiche-title-row",
  },
  selector: "app-fiche-title-row",
  template: `
    <h1
      [class.fiche-page-title--mono]="mono()"
      class="fiche-page-title"
    >
      {{ title() }}
    </h1>
    <ng-content />
  `,
})
export class FicheTitleRow {
  readonly mono = input(false);
  readonly title = input.required<string>();
}
