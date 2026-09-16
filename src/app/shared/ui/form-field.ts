import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/** Label, control slot, and inline validation message for form inputs. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-form-field",
  template: `
    <div class="flex flex-col gap-1.5">
      <label [attr.for]="inputId()" class="text-xs font-medium text-muted">
        {{ label() }}
      </label>
      <ng-content />
      @if (error()) {
      <p class="text-xs text-brake" role="alert">{{ error() }}</p>
      }
    </div>
  `,
})
export class FormFieldShell {
  readonly error = input<string | null>(null);
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
}
