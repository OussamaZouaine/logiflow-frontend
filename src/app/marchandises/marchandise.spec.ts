import {
  draftToWrite,
  emptyMarchandiseDraft,
  formatMarchandiseLabel,
} from "./marchandise";

describe("marchandise helpers", () => {
  it("formats catalogue label", () => {
    expect(
      formatMarchandiseLabel({ code: "PAL-EUR", libelle: "Palette EUR" })
    ).toBe("PAL-EUR — Palette EUR");
  });

  it("maps draft to write payload", () => {
    const draft = emptyMarchandiseDraft();
    draft.code = "pal-eur";
    draft.libelle = "Palette EUR";
    draft.famille = "Palettes";

    expect(draftToWrite(draft)).toEqual({
      code: "PAL-EUR",
      famille: "Palettes",
      gerbable: true,
      libelle: "Palette EUR",
    });
  });
});
