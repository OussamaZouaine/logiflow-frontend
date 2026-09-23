import {
  afterNextRender,
  Component,
  computed,
  type ElementRef,
  effect,
  Injector,
  inject,
  type OnDestroy,
  signal,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideHistory,
  lucideLoaderCircle,
  lucidePencil,
  lucidePlus,
  lucideSend,
  lucideSparkles,
  lucideSquare,
  lucideThumbsDown,
  lucideThumbsUp,
  lucideTrash2,
  lucideWrench,
  lucideX,
} from "@ng-icons/lucide";
import {
  COPILOTE_QUESTION_MAX_LENGTH,
  COPILOTE_SUGGESTIONS,
  type ConversationCopilote,
  canSubmitCopiloteQuestion,
  libelleTypeSource,
  routeSource,
} from "../ia/copilote";
import { renderMarkdown } from "../ia/copilote-markdown";
import { CopiloteStore } from "../ia/copilote-store";
import {
  isTopmostOverlay,
  popOverlay,
  pushOverlay,
} from "../shared/core/overlay/overlay-stack";

type Vue = "chat" | "historique";

/**
 * Bouton « Copilote » du header + panneau latéral de chat. Non modal : on peut
 * naviguer dans l'application (liens des sources) en gardant la conversation ouverte.
 */
@Component({
  host: {
    "(document:keydown.escape)": "onEscape($event)",
  },
  imports: [NgIcon, RouterLink],
  providers: [
    provideIcons({
      lucideHistory,
      lucideLoaderCircle,
      lucidePencil,
      lucidePlus,
      lucideSend,
      lucideSparkles,
      lucideSquare,
      lucideThumbsDown,
      lucideThumbsUp,
      lucideTrash2,
      lucideWrench,
      lucideX,
    }),
  ],
  selector: "app-copilote-panel",
  styleUrl: "./copilote-panel.css",
  templateUrl: "./copilote-panel.html",
})
export class CopilotePanel implements OnDestroy {
  protected readonly store = inject(CopiloteStore);
  private readonly injector = inject(Injector);
  /** Référence d'identité pour la pile d'overlays (Escape ferme le plus haut). */
  private readonly overlayRef = {};

  private readonly declencheur =
    viewChild<ElementRef<HTMLButtonElement>>("declencheur");
  private readonly saisie =
    viewChild<ElementRef<HTMLTextAreaElement>>("saisie");
  private readonly fil = viewChild<ElementRef<HTMLElement>>("fil");

  protected readonly questionMaxLength = COPILOTE_QUESTION_MAX_LENGTH;
  protected readonly suggestions = COPILOTE_SUGGESTIONS;
  protected readonly routeSource = routeSource;
  protected readonly libelleTypeSource = libelleTypeSource;

  protected readonly open = signal(false);
  protected readonly vue = signal<Vue>("chat");
  protected readonly question = signal("");
  protected readonly renommageId = signal<string | null>(null);
  protected readonly suppressionId = signal<string | null>(null);

  protected readonly peutEnvoyer = computed(
    () => canSubmitCopiloteQuestion(this.question()) && !this.store.enCours()
  );
  protected readonly titre = computed(
    () => this.store.conversationActive()?.titre ?? "Nouvelle conversation"
  );

  /** Rendu Markdown mémoïsé par contenu (les tokens arrivent un à un). */
  private readonly cacheMarkdown = new Map<string, string>();

  constructor() {
    // Suit le flux : défile vers le bas à chaque nouveau token.
    effect(() => {
      this.store.messages();
      afterNextRender(
        () => {
          const fil = this.fil()?.nativeElement;
          if (fil) {
            fil.scrollTop = fil.scrollHeight;
          }
        },
        { injector: this.injector }
      );
    });
  }

  ngOnDestroy(): void {
    popOverlay(this.overlayRef);
    this.store.arreter();
  }

  protected html(contenu: string): string {
    let rendu = this.cacheMarkdown.get(contenu);
    if (rendu === undefined) {
      rendu = renderMarkdown(contenu);
      if (this.cacheMarkdown.size > 200) {
        this.cacheMarkdown.clear();
      }
      this.cacheMarkdown.set(contenu, rendu);
    }
    return rendu;
  }

  protected toggle(): void {
    if (this.open()) {
      this.fermer();
    } else {
      this.ouvrir();
    }
  }

  protected ouvrir(): void {
    this.open.set(true);
    pushOverlay(this.overlayRef);
    this.store.chargerConversations();
    this.focaliserSaisie();
  }

  protected fermer(): void {
    this.open.set(false);
    popOverlay(this.overlayRef);
    this.renommageId.set(null);
    this.suppressionId.set(null);
    this.declencheur()?.nativeElement.focus();
  }

  protected onEscape(event: Event): void {
    if (!(this.open() && isTopmostOverlay(this.overlayRef))) {
      return;
    }
    event.preventDefault();
    if (this.vue() === "historique") {
      this.vue.set("chat");
      return;
    }
    this.fermer();
  }

  protected onQuestionInput(event: Event): void {
    const { target } = event;
    if (target instanceof HTMLTextAreaElement) {
      this.question.set(target.value);
    }
  }

  protected onQuestionKeydown(event: KeyboardEvent): void {
    // Entrée envoie, Maj+Entrée va à la ligne (pas pendant une composition IME).
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.envoyer();
    }
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.envoyer();
  }

  protected poser(suggestion: string): void {
    this.question.set(suggestion);
    this.envoyer();
  }

  protected envoyer(): void {
    if (!this.peutEnvoyer()) {
      return;
    }
    const question = this.question();
    this.question.set("");
    this.store.envoyer(question);
    this.focaliserSaisie();
  }

  protected nouvelle(): void {
    this.store.nouvelle();
    this.vue.set("chat");
    this.focaliserSaisie();
  }

  protected async ouvrirConversation(
    conversation: ConversationCopilote
  ): Promise<void> {
    this.vue.set("chat");
    await this.store.ouvrir(conversation.id);
    this.focaliserSaisie();
  }

  protected basculerHistorique(): void {
    this.vue.update((vue) => (vue === "chat" ? "historique" : "chat"));
    this.renommageId.set(null);
    this.suppressionId.set(null);
  }

  protected async validerRenommage(id: string, event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const champ = form.elements.namedItem("titre");
    if (champ instanceof HTMLInputElement) {
      await this.store.renommer(id, champ.value);
    }
    this.renommageId.set(null);
  }

  protected async confirmerSuppression(id: string): Promise<void> {
    this.suppressionId.set(null);
    await this.store.supprimer(id);
  }

  private focaliserSaisie(): void {
    afterNextRender(() => this.saisie()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }
}
