import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/** Grouped form block inside a surface panel with a title and optional hint. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block",
  },
  selector: "app-form-section",
  template: `
    <section class="surface-panel flex flex-col gap-5 p-5">
      <div>
        <h2 class="text-base font-medium tracking-tight text-ink">
          {{ title() }}
        </h2>
        @if (description()) {
        <p class="mt-1 text-sm text-muted">{{ description() }}</p>
        }
      </div>
      <ng-content />
    </section>
  `,
})
export class FormSection {
  readonly description = input<string>();
  readonly title = input.required<string>();
}
