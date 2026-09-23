import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSearch, lucideX } from "@ng-icons/lucide";
import { ZardInputComponent } from "@/shared/components/input";
import {
  ZardInputGroupAddonComponent,
  ZardInputGroupButtonDirective,
  ZardInputGroupComponent,
} from "@/shared/components/input-group";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-list-search-bar",
  imports: [
    NgIcon,
    ZardInputComponent,
    ZardInputGroupComponent,
    ZardInputGroupAddonComponent,
    ZardInputGroupButtonDirective,
  ],
  viewProviders: [provideIcons({ lucideSearch, lucideX })],
  template: `
    <form (submit)="onSubmit($event)" class="list-search-bar">
      <label class="sr-only" [attr.for]="inputId()">{{ label() }}</label>
      <z-input-group class="list-search-bar__field list-search-bar__field--compact">
        <z-input-group-addon zAlign="inline-start">
          <ng-icon aria-hidden="true" name="lucideSearch" />
        </z-input-group-addon>
        <input
          (input)="onInput($event)"
          (keydown.escape)="clear($event)"
          [attr.id]="inputId()"
          [placeholder]="placeholder()"
          [value]="draft()"
          autocomplete="off"
          class="min-w-0"
          type="search"
          z-input
        />
        @if (draft()) {
        <z-input-group-addon zAlign="inline-end">
          <button
            (click)="clear($event)"
            aria-label="Effacer la recherche"
            type="button"
            z-input-group-button
          >
            <ng-icon aria-hidden="true" name="lucideX" />
          </button>
        </z-input-group-addon>
        }
      </z-input-group>
    </form>
  `,
  styles: `
    .list-search-bar {
      display: block;
      min-width: 0;
      width: 100%;
    }

    .list-search-bar__field {
      min-width: 0;
      width: 100%;
    }

    :host ::ng-deep .list-search-bar__field--compact {
      min-height: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-lg);
    }
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

  protected clear(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.draft.set("");
    this.query.set("");
  }
}
