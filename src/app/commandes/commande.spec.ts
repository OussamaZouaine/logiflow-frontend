import {
  draftToWrite,
  emptyCommandeDraft,
  validateLignesCommande,
} from "./commande";

describe("commande helpers", () => {
  it("maps draft lignes into CommandeWrite", () => {
    const draft = emptyCommandeDraft();
    draft.lignes[0] = {
      marchandiseId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      nbColis: 10,
      poidsKg: 500,
      volumeM3: 4,
    };

    const body = draftToWrite(draft, "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    expect(body.lignes).toEqual([
      {
        marchandiseId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        nbColis: 10,
        poidsKg: 500,
        volumeM3: 4,
      },
    ]);
  });

  it("rejects empty lignes", () => {
    expect(validateLignesCommande([])).toContain("au moins une ligne");
  });

  it("rejects a line without marchandise", () => {
    expect(
      validateLignesCommande([
        {
          marchandiseId: "",
          nbColis: 1,
          poidsKg: 1,
          volumeM3: 1,
        },
      ])
    ).toContain("marchandise");
  });
});
