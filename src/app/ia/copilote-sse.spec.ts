import { decoderEvenement, ParseurSse } from "./copilote-sse";

describe("ParseurSse", () => {
  it("returns only complete events, across arbitrary chunk boundaries", () => {
    const parseur = new ParseurSse();

    expect(parseur.pousser('event:meta\ndata:{"conversationId":"c1",')).toEqual(
      []
    );
    expect(
      parseur.pousser(
        '"messageId":"m1"}\n\nevent: token\ndata: {"texte":"Bon"}\n'
      )
    ).toEqual([
      { donnees: '{"conversationId":"c1","messageId":"m1"}', nom: "meta" },
    ]);
    expect(
      parseur.pousser('\nevent:token\r\ndata:{"texte":"jour"}\r\n\r\n')
    ).toEqual([
      { donnees: '{"texte":"Bon"}', nom: "token" },
      { donnees: '{"texte":"jour"}', nom: "token" },
    ]);
  });

  it("flushes a trailing event without blank line and ignores comments", () => {
    const parseur = new ParseurSse();
    expect(parseur.pousser(": ping\n\n")).toEqual([]);
    parseur.pousser('event:fin\ndata:{"messageId":"m1"}');
    expect(parseur.terminer()).toEqual([
      { donnees: '{"messageId":"m1"}', nom: "fin" },
    ]);
  });

  it("decodes JSON payloads and drops unreadable ones", () => {
    expect(
      decoderEvenement({ donnees: '{"texte":"a"}', nom: "token" })
    ).toEqual({
      donnees: { texte: "a" },
      nom: "token",
    });
    expect(decoderEvenement({ donnees: "{oops", nom: "token" })).toBeNull();
  });
});
