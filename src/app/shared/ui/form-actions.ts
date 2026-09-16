import { ChangeDetectionStrategy, Component } from "@angular/core";

/** Sticky save / cancel bar that stays visible while long forms scroll. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "form-actions sticky bottom-0 z-10 -mx-6 mt-2 flex flex-wrap items-center gap-3 border-t border-line bg-canvas/95 px-6 py-4 backdrop-blur-sm",
  },
  selector: "app-form-actions",
  template: `<ng-content />`,
})
export class FormActions {}
