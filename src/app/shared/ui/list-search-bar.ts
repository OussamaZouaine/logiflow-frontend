import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-list-search-bar",
  template: `
    <form (submit)="onSubmit($event)" class="flex gap-2">
      <label class="sr-only" [attr.for]="inputId()">{{ label() }}</label>
      <input
        (input)="onInput($event)"
        [attr.id]="inputId()"
        [placeholder]="placeholder()"
        [value]="draft()"
        class="field min-w-0 flex-1"
        type="search"
      />
      <button
        class="pressable pressable-border shrink-0 border border-line px-4 py-2 text-sm font-medium text-ink"
        type="submit"
      >
        Chercher
      </button>
    </form>
  `,
})
export class ListSearchBar {
  readonly draft = model.required<string>();
  readonly query = model.required<string>();
  readonly inputId = input.required<string>();
  readonly label = input("Rechercher");
  readonly placeholder = input("Rechercher…");

  protected onInput(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.draft.set(target.value);
    }
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.query.set(this.draft().trim());
  }
}
