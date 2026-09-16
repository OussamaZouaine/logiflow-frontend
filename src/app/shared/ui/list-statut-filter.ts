import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";

export interface ListStatutOption {
  label: string;
  value: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-list-statut-filter",
  template: `
    <div
      [attr.aria-label]="ariaLabel()"
      class="flex flex-wrap gap-2"
      role="group"
    >
      <button
        (click)="clear()"
        [attr.aria-pressed]="selected() === null"
        [class]="chipClass(selected() === null)"
        type="button"
      >
        Tous
      </button>
      @for (option of options(); track option.value) {
      <button
        (click)="select(option.value)"
        [attr.aria-pressed]="selected() === option.value"
        [class]="chipClass(selected() === option.value)"
        type="button"
      >
        {{ option.label }}
      </button>
      }
    </div>
  `,
})
export class ListStatutFilter {
  readonly options = input.required<readonly ListStatutOption[]>();
  readonly selected = model<string | null>(null);
  readonly ariaLabel = input("Filtrer par statut");

  protected clear(): void {
    this.selected.set(null);
  }

  protected select(value: string): void {
    this.selected.set(this.selected() === value ? null : value);
  }

  protected chipClass(active: boolean): string {
    return active
      ? "pressable rounded-md border border-pine/30 bg-pine/10 px-2.5 py-1.5 text-xs font-medium text-pine"
      : "pressable rounded-md border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-muted hover:border-pine/40 hover:bg-surface hover:text-ink";
  }
}
