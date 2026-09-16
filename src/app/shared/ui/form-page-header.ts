import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

/** Sticky header for create / edit forms: back link, title, optional hint. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "sticky top-0 z-10 -mx-6 mb-2 block border-b border-line bg-canvas/95 px-6 py-3 backdrop-blur-sm",
  },
  imports: [RouterLink],
  selector: "app-form-page-header",
  template: `
    <a [routerLink]="listLink()" class="btn-back pressable">
      ← {{ listLabel() }}
    </a>
    <div class="mt-3">
      <h1 class="module-page-title">{{ title() }}</h1>
      @if (description()) {
      <p class="mt-1 text-sm text-muted">{{ description() }}</p>
      }
    </div>
  `,
})
export class FormPageHeader {
  readonly description = input<string>();
  readonly listLabel = input.required<string>();
  readonly listLink = input.required<string>();
  readonly title = input.required<string>();
}
