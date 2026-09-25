import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { InnerPageHeader } from "./inner-page-header";

/** Header for create / edit forms: title, optional module icon and hint. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InnerPageHeader],
  selector: "app-form-page-header",
  template: `
    <app-inner-page-header
      [description]="description()"
      [icon]="icon()"
      [title]="title()"
    />
  `,
})
export class FormPageHeader {
  readonly description = input<string>();
  readonly icon = input<string | null>(null);
  readonly title = input.required<string>();
}
