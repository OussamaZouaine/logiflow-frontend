import {
  draftToWrite,
  emptyRemorqueDraft,
  formatRemorqueLabel,
  remorqueStatutLabel,
} from "./remorque";

describe("remorque helpers", () => {
  it("formats list label with immat, carrosserie and statut", () => {
    expect(
      formatRemorqueLabel({
        carrosserie: "TAUTLINER",
        immatriculation: "AB-123-CD",
        statut: "DISPONIBLE",
      })
    ).toContain("AB-123-CD");
    expect(
      formatRemorqueLabel({
        carrosserie: "TAUTLINER",
        immatriculation: "AB-123-CD",
        statut: "DISPONIBLE",
      })
    ).toContain(remorqueStatutLabel("DISPONIBLE"));
  });

  it("maps draft to write payload", () => {
    const draft = emptyRemorqueDraft();
    draft.immatriculation = "ab-123-cd";

    expect(draftToWrite(draft)).toEqual({
      carrosserie: "TAUTLINER",
      chargeUtileKg: 24_000,
      groupeFroid: false,
      immatriculation: "AB-123-CD",
      nbPositionsPalettes: 33,
      volumeUtileM3: 80,
    });
  });
});
