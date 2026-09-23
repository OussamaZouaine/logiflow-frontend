import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideListFilter } from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";

export interface ListStatutOption {
  label: string;
  value: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-list-statut-filter",
  imports: [NgIcon, ZardButtonComponent],
  viewProviders: [provideIcons({ lucideListFilter })],
  template: `
    <div class="list-statut-filter">
      <p class="list-statut-filter__label" id="list-statut-filter-label">
        <ng-icon aria-hidden="true" name="lucideListFilter" />
        Statut
      </p>
      <div
        [attr.aria-labelledby]="'list-statut-filter-label'"
        [attr.aria-label]="ariaLabel()"
        class="list-statut-filter__chips"
        role="group"
      >
        <button
          (click)="clear()"
          [attr.aria-pressed]="selected() === null"
          type="button"
          z-button
          zSize="sm"
          [zType]="selected() === null ? 'default' : 'outline'"
        >
          Tous
        </button>
        @for (option of options(); track option.value) {
        <button
          (click)="select(option.value)"
          [attr.aria-pressed]="selected() === option.value"
          type="button"
          z-button
          zSize="sm"
          [zType]="selected() === option.value ? 'default' : 'outline'"
        >
          {{ option.label }}
        </button>
        }
      </div>
    </div>
  `,
  styles: `
    .list-statut-filter {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 0;
    }

    .list-statut-filter__label {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: var(--color-muted);
    }

    .list-statut-filter__label ng-icon {
      width: 0.875rem;
      height: 0.875rem;
      opacity: 0.85;
    }

    .list-statut-filter__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      min-width: 0;
    }

    @media (max-width: 639px) {
      .list-statut-filter__chips {
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 0.125rem;
        scrollbar-width: none;
      }

      .list-statut-filter__chips::-webkit-scrollbar {
        display: none;
      }
    }
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
}
