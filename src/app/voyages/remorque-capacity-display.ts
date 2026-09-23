import { DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { provideIcons } from "@ng-icons/core";
import { lucideCircleAlert } from "@ng-icons/lucide";
import { ZardAlertComponent } from "@/shared/components/alert";
import {
  ZardCardComponent,
  ZardCardContentComponent,
  ZardCardDescriptionComponent,
  ZardCardHeaderComponent,
  ZardCardTitleComponent,
} from "@/shared/components/card/card.component";
import {
  capaciteTronconLabel,
  capaciteTronconTone,
  capaciteTronconToneClass,
  tronconParDepart,
  type VoyageCapacite,
} from "./voyage-capacite";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    ZardAlertComponent,
    ZardCardComponent,
    ZardCardContentComponent,
    ZardCardDescriptionComponent,
    ZardCardHeaderComponent,
    ZardCardTitleComponent,
  ],
  providers: [provideIcons({ lucideCircleAlert })],
  selector: "app-remorque-capacity-display",
  templateUrl: "./remorque-capacity-display.html",
})
export class RemorqueCapacityDisplay {
  readonly capacite = input.required<VoyageCapacite | null>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly preview = input(false);

  protected readonly capaciteTronconLabel = capaciteTronconLabel;
  protected readonly capaciteTronconTone = capaciteTronconTone;
  protected readonly capaciteTronconToneClass = capaciteTronconToneClass;
  protected readonly tronconParDepart = tronconParDepart;

  protected barWidth(pourcentageMax: number): number {
    return Math.min(Math.max(pourcentageMax, 0), 100);
  }
}
