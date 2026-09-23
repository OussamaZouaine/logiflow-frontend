import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideMoreHorizontal,
} from "@ng-icons/lucide";
import { ZardButtonComponent } from "@/shared/components/button";
import { buildPaginationRange } from "./pagination-range";

let nextPageSizeSelectId = 0;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-list-pagination",
  imports: [NgIcon, ZardButtonComponent],
  viewProviders: [
    provideIcons({ lucideChevronLeft, lucideChevronRight, lucideMoreHorizontal }),
  ],
  template: `
    @if (showFooter()) {
    <nav
      aria-label="Pagination"
      class="list-pagination"
    >
      <div class="list-pagination__meta">
        <p class="list-pagination__summary">
          {{ summaryText() }}
        </p>

        @if (showPageSizeSelector()) {
        <div class="list-pagination__size">
          <label class="list-pagination__size-label" [for]="pageSizeSelectId">
            Par page
          </label>
          <select
            (change)="onPageSizeChange($event)"
            [id]="pageSizeSelectId"
            aria-label="Nombre d'éléments par page"
            class="list-pagination__size-select"
          >
            @for (size of pageSizeOptions(); track size) {
            <option [selected]="pageSize() === size" [value]="size">
              {{ size }}
            </option>
            }
          </select>
        </div>
        }
      </div>

      @if (totalPages() > 1) {
      <div class="list-pagination__controls">
        <button
          (click)="goPrevious()"
          [attr.aria-label]="'Page précédente'"
          [disabled]="page() <= 0"
          class="list-pagination__nav"
          type="button"
          z-button
          zSize="sm"
          zType="outline"
        >
          <ng-icon aria-hidden="true" name="lucideChevronLeft" />
          <span class="list-pagination__nav-label">Précédent</span>
        </button>

        <div class="list-pagination__pages" role="group" aria-label="Numéros de page">
          @for (item of pageItems(); track trackPageItem($index, item)) {
          @if (item === "ellipsis") {
          <span aria-hidden="true" class="list-pagination__ellipsis">
            <ng-icon name="lucideMoreHorizontal" />
          </span>
          } @else {
          <button
            (click)="goToPage(item)"
            [attr.aria-current]="page() === item ? 'page' : null"
            [attr.aria-label]="'Page ' + (item + 1)"
            type="button"
            z-button
            zSize="sm"
            [zType]="page() === item ? 'default' : 'outline'"
          >
            {{ item + 1 }}
          </button>
          }
          }
        </div>

        <button
          (click)="goNext()"
          [attr.aria-label]="'Page suivante'"
          [disabled]="page() >= totalPages() - 1"
          class="list-pagination__nav"
          type="button"
          z-button
          zSize="sm"
          zType="outline"
        >
          <span class="list-pagination__nav-label">Suivant</span>
          <ng-icon aria-hidden="true" name="lucideChevronRight" />
        </button>
      </div>
      }
    </nav>
    }
  `,
  styles: `
    .list-pagination {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--color-surface);
      border: 1px solid color-mix(in oklch, var(--color-line) 80%, transparent);
      border-radius: var(--radius-xl);
      box-shadow:
        0 1px 2px oklch(0 0 0 / 0.04),
        0 4px 14px oklch(0 0 0 / 0.03);
    }

    @media (min-width: 640px) {
      .list-pagination {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.625rem 1rem;
      }
    }

    .list-pagination__meta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
    }

    @media (min-width: 640px) {
      .list-pagination__meta {
        flex-direction: row;
        align-items: center;
        gap: 0.75rem;
      }
    }

    .list-pagination__summary {
      margin: 0;
      font-size: 0.8125rem;
      line-height: 1.4;
      font-variant-numeric: tabular-nums;
      color: var(--color-muted);
      text-align: center;
    }

    @media (min-width: 640px) {
      .list-pagination__summary {
        text-align: left;
      }
    }

    .list-pagination__size {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      flex-shrink: 0;
    }

    .list-pagination__size-label {
      font-size: 0.75rem;
      line-height: 1;
      color: var(--color-muted);
      white-space: nowrap;
    }

    .list-pagination__size-select {
      min-width: 3.25rem;
      height: 1.75rem;
      padding: 0 0.5rem;
      font-size: 0.8125rem;
      font-variant-numeric: tabular-nums;
      color: var(--color-ink);
      background: var(--color-surface);
      border: 1px solid color-mix(in oklch, var(--color-line) 80%, transparent);
      border-radius: var(--radius-md);
      cursor: pointer;
    }

    .list-pagination__size-select:focus-visible {
      outline: 2px solid color-mix(in oklch, var(--color-accent) 45%, transparent);
      outline-offset: 1px;
    }

    .list-pagination__controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      width: 100%;
      min-width: 0;
    }

    @media (min-width: 640px) {
      .list-pagination__controls {
        width: auto;
      }
    }

    .list-pagination__pages {
      display: none;
      align-items: center;
      gap: 0.25rem;
    }

    @media (min-width: 480px) {
      .list-pagination__pages {
        display: flex;
      }
    }

    .list-pagination__nav {
      flex-shrink: 0;
    }

    .list-pagination__nav-label {
      display: none;
    }

    @media (min-width: 640px) {
      .list-pagination__nav-label {
        display: inline;
      }
    }

    .list-pagination__ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 1.75rem;
      color: var(--color-muted);
    }

    .list-pagination__ellipsis ng-icon {
      width: 1rem;
      height: 1rem;
    }
  `,
})
export class ListPagination {
  readonly page = model.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalElements = input<number | null>(null);
  readonly pageSize = input.required<number>();
  readonly pageSizeChange = output<number>();
  readonly pageSizeOptions = input<readonly number[] | null>(null);
  readonly visibleCount = input<number | null>(null);
  readonly itemLabel = input("élément");

  protected readonly pageSizeSelectId = `list-pagination-size-${nextPageSizeSelectId++}`;

  protected readonly showPageSizeSelector = computed(() => {
    const options = this.pageSizeOptions();
    return options !== null && options.length > 0;
  });

  protected readonly pageItems = computed(() =>
    buildPaginationRange(this.page(), this.totalPages())
  );

  protected readonly showFooter = computed(() => {
    const total = this.totalElements();
    if (total !== null) {
      return total > 0 || this.totalPages() > 1;
    }
    return this.totalPages() > 1;
  });

  protected readonly summaryText = computed(() => {
    const total = this.totalElements();
    const current = this.page();
    const size = this.pageSize();
    const label = this.itemLabel();
    const plural = label.endsWith("s") ? label : `${label}s`;
    const visible = this.visibleCount();

    if (total === null) {
      return `Page ${current + 1} sur ${this.totalPages()}`;
    }

    if (total === 0) {
      return `Aucun ${label}`;
    }

    const start = current * size + 1;
    const end = Math.min((current + 1) * size, total);

    if (visible !== null && visible < end - start + 1) {
      return `${visible} affiché(s) sur ${total} ${total > 1 ? plural : label} · page ${current + 1}/${this.totalPages()}`;
    }

    if (start === end) {
      return `${start} sur ${total} ${total > 1 ? plural : label}`;
    }

    return `${start}–${end} sur ${total} ${total > 1 ? plural : label}`;
  });

  protected trackPageItem(index: number, item: number | "ellipsis"): string {
    return item === "ellipsis" ? `ellipsis-${index}` : `page-${item}`;
  }

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

  protected goToPage(pageIndex: number): void {
    if (pageIndex < 0 || pageIndex >= this.totalPages()) {
      return;
    }
    this.page.set(pageIndex);
  }

  protected onPageSizeChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const next = Number.parseInt(raw, 10);
    const options = this.pageSizeOptions();
    if (
      !Number.isFinite(next) ||
      options === null ||
      !options.includes(next) ||
      next === this.pageSize()
    ) {
      return;
    }
    this.pageSizeChange.emit(next);
    this.page.set(0);
  }
}
