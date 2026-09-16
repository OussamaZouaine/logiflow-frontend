import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/** Top-of-form banner when validation failed after submit or touch. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-form-validation-summary",
  template: `
    @if (show()) {
    <div class="alert-panel" role="alert">
      <p class="font-medium">Certains champs sont à corriger.</p>
      <p class="mt-1 text-xs text-brake/90">
        Consultez les messages sous chaque champ en surbrillance.
      </p>
    </div>
    }
  `,
})
export class FormValidationSummary {
  readonly show = input(false);
}
