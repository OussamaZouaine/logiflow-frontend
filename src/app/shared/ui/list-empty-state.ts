import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: "app-list-empty-state",
  template: `
    <div
      class="surface-panel px-6 py-10 text-center"
      role="status"
    >
      <p class="text-sm font-medium text-ink">{{ title() }}</p>
      @if (description(); as text) {
      <p class="mx-auto mt-1 max-w-md text-sm text-muted">{{ text }}</p>
      }
      @if (actionLabel(); as label) {
      <div class="mt-5">
        @if (actionLink(); as link) {
        <a
          [routerLink]="link"
          class="btn-primary pressable"
        >
          {{ label }}
        </a>
        } @else {
        <button
          (click)="action.emit()"
          class="btn-outline pressable"
          type="button"
        >
          {{ label }}
        </button>
        }
      </div>
      }
    </div>
  `,
})
export class ListEmptyState {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly actionLink = input<string | null>(null);
  readonly action = output<void>();
}
