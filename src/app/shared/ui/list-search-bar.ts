import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSearch, lucideX } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
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
    ZardButtonComponent,
    ZardInputComponent,
    ZardInputGroupComponent,
    ZardInputGroupAddonComponent,
    ZardInputGroupButtonDirective,
  ],
  viewProviders: [provideIcons({ lucideSearch, lucideX })],
  template: `
    <form (submit)="onSubmit($event)" class="list-search-bar">
      <label class="sr-only" [attr.for]="inputId()">{{ label() }}</label>
      <z-input-group class="list-search-bar__field">
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
      <button class="list-search-bar__submit" type="submit" z-button zType="default">
        Chercher
      </button>
    </form>
  `,
  styles: `
    .list-search-bar {
      display: flex;
      gap: 0.5rem;
      align-items: stretch;
    }

    .list-search-bar__field {
      min-width: 0;
      flex: 1;
    }

    .list-search-bar__submit {
      flex-shrink: 0;
    }

    @media (max-width: 479px) {
      .list-search-bar {
        flex-direction: column;
      }

      .list-search-bar__submit {
        width: 100%;
        justify-content: center;
      }
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
