import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";

/** Checkbox row with inset surface for edit fiches. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-fiche-checkbox-row",
  template: `
    <label class="fiche-checkbox-row">
      <input
        (change)="onChange($event)"
        [attr.aria-describedby]="hint() ? hintId : null"
        [checked]="checked()"
        class="fiche-checkbox-row__input"
        type="checkbox"
      />
      <span class="fiche-checkbox-row__text">
        <span class="fiche-checkbox-row__label">{{ label() }}</span>
        @if (hint()) {
        <span [id]="hintId" class="fiche-checkbox-row__hint">{{ hint() }}</span>
        }
      </span>
    </label>
  `,
})
export class FicheCheckboxRow {
  readonly checked = input(false);
  readonly hint = input<string>();
  readonly label = input.required<string>();
  readonly checkedChange = output<boolean>();

  protected readonly hintId = `fiche-checkbox-${FicheCheckboxRow.nextId()}`;

  private static nextIdValue = 0;

  private static nextId(): string {
    FicheCheckboxRow.nextIdValue += 1;
    return String(FicheCheckboxRow.nextIdValue);
  }

  protected onChange(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.checkedChange.emit(target.checked);
    }
  }
}
