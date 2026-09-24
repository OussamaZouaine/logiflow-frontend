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
  untracked,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCheck,
  lucideCircleAlert,
  lucideClock,
  lucideLoaderCircle,
  lucideMessageSquare,
  lucidePanelLeft,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
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
  afficherEtat,
  COPILOTE_QUESTION_MAX_LENGTH,
  COPILOTE_SUGGESTIONS,
  type ConversationCopilote,
  canSubmitCopiloteQuestion,
  formatDateRelative,
  formatDuree,
  formatHeure,
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

/** Rafraîchissement de la pastille d'état tant que le panneau est ouvert. */
const INTERVALLE_ETAT_MS = 30_000;
const INTERVALLE_HORLOGE_MS = 1000;

/**
 * Panneau latéral droit du copilote, rendu à la racine du shell : historique des
 * conversations à gauche, fil de messages à droite, état du moteur IA en tête.
 * Non modal : on peut naviguer dans l'application (liens des sources) en le gardant ouvert.
 */
@Component({
  host: {
    "(document:keydown.escape)": "onEscape($event)",
  },
  imports: [NgIcon, RouterLink],
  providers: [
    provideIcons({
      lucideCheck,
      lucideCircleAlert,
      lucideClock,
      lucideLoaderCircle,
      lucideMessageSquare,
      lucidePanelLeft,
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
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

  private readonly saisie =
    viewChild<ElementRef<HTMLTextAreaElement>>("saisie");
  private readonly fil = viewChild<ElementRef<HTMLElement>>("fil");

  protected readonly questionMaxLength = COPILOTE_QUESTION_MAX_LENGTH;
  protected readonly suggestions = COPILOTE_SUGGESTIONS;
  protected readonly routeSource = routeSource;
  protected readonly libelleTypeSource = libelleTypeSource;
  protected readonly formatHeure = formatHeure;

  protected readonly question = signal("");
  /** Colonne historique visible sur petit écran (toujours visible en large). */
  protected readonly historiqueMobile = signal(false);
  protected readonly renommageId = signal<string | null>(null);
  protected readonly suppressionId = signal<string | null>(null);
  protected readonly maintenant = signal(Date.now());

  protected readonly etat = computed(() => afficherEtat(this.store.etat()));
  protected readonly peutEnvoyer = computed(
    () => canSubmitCopiloteQuestion(this.question()) && !this.store.enCours()
  );
  protected readonly titre = computed(
    () => this.store.conversationActive()?.titre ?? "Nouvelle conversation"
  );
  protected readonly dureeReponse = computed(() => {
    const debut = this.store.debutReponse();
    return debut === null ? "" : formatDuree(this.maintenant() - debut);
  });

  /** Rendu Markdown mémoïsé par contenu (les tokens arrivent un à un). */
  private readonly cacheMarkdown = new Map<string, string>();

  constructor() {
    // Ouverture / fermeture : pile d'Escape, historique, état, focus.
    effect((onCleanup) => {
      if (!this.store.ouvert()) {
        return;
      }
      pushOverlay(this.overlayRef);
      // untracked : seul `ouvert` doit relancer cet effet (sinon l'arrivée de
      // l'historique redéclenche une vérification et un second minuteur).
      untracked(() => {
        if (!this.store.conversationsChargees()) {
          this.store.chargerConversations();
        }
        this.store.verifierEtat();
      });
      const minuterie = setInterval(
        () => this.store.verifierEtat(),
        INTERVALLE_ETAT_MS
      );
      this.focaliserSaisie();
      onCleanup(() => {
        clearInterval(minuterie);
        popOverlay(this.overlayRef);
      });
    });

    // Chronomètre « Réflexion… 45 s » pendant une réponse.
    effect((onCleanup) => {
      if (!this.store.enCours()) {
        return;
      }
      this.maintenant.set(Date.now());
      const horloge = setInterval(
        () => this.maintenant.set(Date.now()),
        INTERVALLE_HORLOGE_MS
      );
      onCleanup(() => clearInterval(horloge));
    });

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

  protected dateRelative(conversation: ConversationCopilote): string {
    return formatDateRelative(conversation.modifieLe, this.maintenant());
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

  protected fermer(): void {
    this.store.fermer();
    this.renommageId.set(null);
    this.suppressionId.set(null);
    document.getElementById("app-copilote-bouton")?.focus();
  }

  protected onEscape(event: Event): void {
    if (!(this.store.ouvert() && isTopmostOverlay(this.overlayRef))) {
      return;
    }
    event.preventDefault();
    if (this.renommageId() || this.suppressionId()) {
      this.renommageId.set(null);
      this.suppressionId.set(null);
      return;
    }
    if (this.historiqueMobile()) {
      this.historiqueMobile.set(false);
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
    this.historiqueMobile.set(false);
    this.focaliserSaisie();
  }

  protected async ouvrirConversation(
    conversation: ConversationCopilote
  ): Promise<void> {
    this.historiqueMobile.set(false);
    if (conversation.id === this.store.conversationActiveId()) {
      return;
    }
    await this.store.ouvrir(conversation.id);
    this.focaliserSaisie();
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
