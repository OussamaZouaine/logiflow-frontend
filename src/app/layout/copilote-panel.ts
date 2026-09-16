import {
  Component,
  HostListener,
  inject,
  signal,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideSparkles, lucideX } from "@ng-icons/lucide";
import { httpErrorMessage } from "../core/api/http-error";
import {
  canSubmitCopiloteQuestion,
  COPILOTE_QUESTION_MAX_LENGTH,
  formatCopiloteConfiance,
  type CopiloteResponse,
} from "../ia/copilote";
import { CopiloteApi } from "../ia/copilote-api";

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ lucideSparkles, lucideX })],
  selector: "app-copilote-panel",
  templateUrl: "./copilote-panel.html",
})
export class CopilotePanel {
  private readonly api = inject(CopiloteApi);

  protected readonly questionMaxLength = COPILOTE_QUESTION_MAX_LENGTH;
  protected readonly formatConfiance = formatCopiloteConfiance;

  protected readonly open = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly response = signal<CopiloteResponse | null>(null);

  protected readonly question = signal("");

  protected canSubmit(): boolean {
    return canSubmitCopiloteQuestion(this.question());
  }

  protected onQuestionInput(event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }
    this.question.set(target.value);
  }

  protected toggle(): void {
    this.open.update((value) => !value);
    if (!this.open()) {
      this.resetTransientState();
    }
  }

  protected close(): void {
    this.open.set(false);
    this.resetTransientState();
  }

  protected async onSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!this.canSubmit() || this.loading()) {
      return;
    }

    this.error.set(null);
    this.response.set(null);
    this.loading.set(true);

    try {
      const answer = await this.api.poserQuestion({
        question: this.question().trim(),
      });
      this.response.set(answer);
    } catch (error) {
      this.error.set(httpErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  @HostListener("document:keydown", ["$event"])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.open() || event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    this.close();
  }

  private resetTransientState(): void {
    this.error.set(null);
    this.response.set(null);
    this.loading.set(false);
  }
}
