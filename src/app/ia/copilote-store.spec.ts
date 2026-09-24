import { TestBed } from "@angular/core/testing";
import type { ConversationCopilote, EvenementCopilote } from "./copilote";
import { CopiloteApi, CopiloteFluxError } from "./copilote-api";
import { CopiloteStore } from "./copilote-store";

const CONVERSATION: ConversationCopilote = {
  creeLe: "2026-09-23T10:00:00Z",
  id: "c1",
  modifieLe: "2026-09-23T10:00:00Z",
  titre: "Nouvelle conversation",
};

type Emetteur = (evenement: EvenementCopilote) => void;

function configurer(envoyerMessage: CopiloteApi["envoyerMessage"]) {
  const api = {
    creerConversation: vi.fn().mockResolvedValue(CONVERSATION),
    envoyerMessage: vi.fn(envoyerMessage),
    listerConversations: vi.fn().mockResolvedValue([CONVERSATION]),
    noterMessage: vi.fn().mockResolvedValue(undefined),
    obtenirConversation: vi.fn(),
    renommerConversation: vi.fn(),
    supprimerConversation: vi.fn().mockResolvedValue(undefined),
  };
  TestBed.configureTestingModule({
    providers: [{ provide: CopiloteApi, useValue: api }],
  });
  return { api, store: TestBed.inject(CopiloteStore) };
}

describe("CopiloteStore", () => {
  it("creates a conversation on first message and applies streamed events", async () => {
    const { api, store } = configurer(
      (_id: string, _q: string, emettre: Emetteur) => {
        emettre({
          donnees: { conversationId: "c1", messageId: "m1" },
          nom: "meta",
        });
        emettre({
          donnees: {
            libelle: "Recherche des voyages",
            nom: "rechercher_voyages",
            statut: "debut",
          },
          nom: "outil",
        });
        emettre({
          donnees: {
            libelle: "Recherche des voyages",
            nom: "rechercher_voyages",
            statut: "fin",
          },
          nom: "outil",
        });
        emettre({ donnees: { texte: "VOY-1 " }, nom: "token" });
        emettre({ donnees: { texte: "est en cours." }, nom: "token" });
        emettre({
          donnees: {
            sources: [{ id: "v1", reference: "VOY-1", type: "VOYAGE" }],
          },
          nom: "sources",
        });
        emettre({ donnees: { titre: "Voyages en cours" }, nom: "titre" });
        emettre({ donnees: { messageId: "m1" }, nom: "fin" });
        return Promise.resolve();
      }
    );

    await store.envoyer("  Quels voyages sont en cours ?  ");

    expect(api.creerConversation).toHaveBeenCalledOnce();
    expect(api.envoyerMessage.mock.calls[0]?.slice(0, 2)).toEqual([
      "c1",
      "Quels voyages sont en cours ?",
    ]);
    const [question, reponse] = store.messages();
    expect(question).toMatchObject({
      contenu: "Quels voyages sont en cours ?",
      statut: "complet",
    });
    expect(reponse).toMatchObject({
      contenu: "VOY-1 est en cours.",
      id: "m1",
      outils: [{ nom: "rechercher_voyages", statut: "fin" }],
      sources: [{ reference: "VOY-1" }],
      statut: "complet",
    });
    expect(store.conversations()[0]?.titre).toBe("Voyages en cours");
    expect(store.conversationActiveId()).toBe("c1");
    expect(store.enCours()).toBe(false);
  });

  it("marks the answer as interrupted when stopped", async () => {
    const { store } = configurer(
      (_id, _q, emettre, signal) =>
        new Promise((_resolve, reject) => {
          emettre({ donnees: { texte: "Début" }, nom: "token" });
          signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError"))
          );
        })
    );

    const envoi = store.envoyer("Question");
    await Promise.resolve();
    await Promise.resolve();
    store.arreter();
    await envoi;

    expect(store.messages()[1]).toMatchObject({
      contenu: "Début",
      statut: "interrompu",
    });
  });

  it("surfaces stream errors on the answer", async () => {
    const { store } = configurer(() =>
      Promise.reject(
        new CopiloteFluxError("Le copilote est momentanément indisponible.", {
          status: 503,
        })
      )
    );

    await store.envoyer("Question");

    expect(store.messages()[1]).toMatchObject({
      erreur: "Le copilote est momentanément indisponible.",
      statut: "erreur",
    });
    // La question n'a jamais atteint le service IA : échec d'envoi.
    expect(store.messages()[0]?.statut).toBe("erreur");
  });

  it("reports an unreachable backend as an offline service", async () => {
    const { api, store } = configurer(() => Promise.resolve());
    Object.assign(api, {
      etat: vi.fn().mockRejectedValue(new Error("réseau")),
    });

    await store.verifierEtat();

    expect(store.etat()).toMatchObject({
      backendJoignable: false,
      operationnel: false,
    });
  });

  it("reverts a rating when the server rejects it", async () => {
    const { api, store } = configurer(() => Promise.resolve());
    store.messages.set([
      {
        contenu: "x",
        creeLe: "2026-09-23T10:00:00Z",
        erreur: null,
        id: "m1",
        note: null,
        outils: [],
        role: "assistant",
        sources: [],
        statut: "complet",
      },
    ]);
    api.noterMessage.mockRejectedValueOnce(new Error("refus"));

    await store.noter("m1", 1);

    expect(store.messages()[0]?.note).toBeNull();
    expect(store.erreur()).toBe("refus");
  });
});
