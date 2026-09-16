import { documentTypeLabel } from "./document";

describe("document helpers", () => {
  it("labels administrative document types", () => {
    expect(documentTypeLabel("CARTE_GRISE")).toBe("Carte grise");
    expect(documentTypeLabel("PHOTO")).toBe("Photo");
  });
});
