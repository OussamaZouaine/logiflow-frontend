import { ChangeDetectionStrategy, Component, input } from "@angular/core";

export type OpsTimelineKind = "planned" | "actual" | "state";

export interface OpsTimelineEntry {
  /** Formatted instant for display, or null when undated (e.g. current state). */
  readonly at: string | null;
  readonly detail?: string | null;
  readonly id: string;
  readonly kind: OpsTimelineKind;
  readonly label: string;
}

const KIND_LABEL: Record<OpsTimelineKind, string> = {
  actual: "Réel",
  planned: "Prévu",
  state: "État",
};

const KIND_DOT: Record<OpsTimelineKind, string> = {
  actual: "bg-pine",
  planned: "bg-muted",
  state: "bg-ink",
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-ops-timeline",
  template: `
    @if (entries().length === 0) {
    <p class="text-sm text-muted">{{ emptyLabel() }}</p>
    } @else {
    <ol class="flex flex-col">
      @for (entry of entries(); track entry.id; let last = $last) {
      <li class="relative flex gap-3 pb-4 last:pb-0">
        @if (!last) {
        <span
          aria-hidden="true"
          class="absolute top-3 bottom-0 left-[0.3125rem] w-px bg-line"
        ></span>
        }
        <span
          [class]="kindDot(entry.kind)"
          aria-hidden="true"
          class="relative mt-1.5 size-2.5 shrink-0 rounded-full"
        ></span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p class="text-sm font-medium text-ink">{{ entry.label }}</p>
            <span class="text-xs font-medium text-muted">
              {{ kindLabel(entry.kind) }}
            </span>
          </div>
          @if (entry.at) {
          <p class="mt-0.5 font-mono text-xs tabular-nums text-muted">
            {{ entry.at }}
          </p>
          }
          @if (entry.detail) {
          <p class="mt-1 text-sm text-muted">{{ entry.detail }}</p>
          }
        </div>
      </li>
      }
    </ol>
    }
  `,
})
export class OpsTimeline {
  readonly entries = input.required<readonly OpsTimelineEntry[]>();
  readonly emptyLabel = input("Aucun événement à afficher.");

  protected kindLabel(kind: OpsTimelineKind): string {
    return KIND_LABEL[kind];
  }

  protected kindDot(kind: OpsTimelineKind): string {
    return KIND_DOT[kind];
  }
}
