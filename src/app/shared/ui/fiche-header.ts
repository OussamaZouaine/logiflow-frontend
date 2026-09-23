import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon } from "@ng-icons/core";
import { LIST_TABLE_ROW_ICON_PROVIDERS } from "./list-table-row-icons";

/** Header for module fiches: optional module icon + projected title/meta. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block",
    role: "banner",
  },
  imports: [NgIcon],
  selector: "app-fiche-header",
  viewProviders: [LIST_TABLE_ROW_ICON_PROVIDERS],
  template: `
    <div class="inner-page-header">
      <div class="inner-page-header__row">
        @if (icon()) {
        <ng-icon
          [name]="icon()!"
          aria-hidden="true"
          class="inner-page-header__icon"
        />
        }
        <div class="inner-page-header__copy">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class FicheHeader {
  readonly icon = input<string | null>(null);
}
