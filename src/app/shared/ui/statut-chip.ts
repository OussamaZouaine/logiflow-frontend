import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { ApercuTone } from "../../tableau/apercu";

export type StatutTone = ApercuTone;

const TONE_CLASSES: Record<StatutTone, string> = {
  amber: "border-amber/25 bg-amber/10 text-amber",
  brake: "border-brake/20 bg-brake/10 text-brake",
  ink: "border-ink/15 bg-ink/5 text-ink",
  muted: "border-line bg-canvas text-muted",
  pine: "border-pine/20 bg-pine/10 text-pine",
};

export function statutChipClasses(tone: StatutTone): string {
  return `inline-flex items-center border px-2 py-0.5 text-[0.7rem] font-medium tracking-wide ${TONE_CLASSES[tone]}`;
}

export function actifTone(actif: boolean): StatutTone {
  return actif ? "pine" : "muted";
}

export function actifLabel(actif: boolean): string {
  return actif ? "Actif" : "Inactif";
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
  },
  selector: "app-statut-chip",
  template: `{{ label() }}`,
})
export class StatutChip {
  readonly label = input.required<string>();
  readonly tone = input<StatutTone>("muted");

  protected readonly classes = computed(() => statutChipClasses(this.tone()));
}
