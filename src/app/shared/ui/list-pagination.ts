import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-list-pagination",
  template: `
    @if (totalPages() > 1) {
    <nav
      aria-label="Pagination"
      class="surface-panel flex items-center justify-between gap-3 px-4 py-3"
    >
      <button
        (click)="goPrevious()"
        [disabled]="page() <= 0"
        class="btn-outline pressable min-h-9 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
      >
        Précédent
      </button>
      <p class="font-mono text-sm tabular-nums text-muted">
        Page {{ page() + 1 }} / {{ totalPages() }}
      </p>
      <button
        (click)="goNext()"
        [disabled]="page() >= totalPages() - 1"
        class="btn-outline pressable min-h-9 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
      >
        Suivant
      </button>
    </nav>
    }
  `,
})
export class ListPagination {
  readonly page = model.required<number>();
  readonly totalPages = input.required<number>();

  protected goPrevious(): void {
    if (this.page() <= 0) {
      return;
    }
    this.page.update((current) => current - 1);
  }

  protected goNext(): void {
    if (this.page() >= this.totalPages() - 1) {
      return;
    }
    this.page.update((current) => current + 1);
  }
}
