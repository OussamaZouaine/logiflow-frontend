import {
  draftToWrite,
  emptyVoyageDraft,
  totalChargeKgFromDossiers,
  validateDossierIds,
} from "./voyage";

describe("voyage domain helpers", () => {
  it("requires at least one dossier id", () => {
    expect(validateDossierIds([])).toContain("au moins un dossier");
    expect(validateDossierIds(["dossier-1"])).toBeNull();
  });

  it("sums charge from selected dossiers", () => {
    const dossiers = new Map([
      ["d1", { poidsBrutKg: 500, reference: "D1", statut: "CREE", volumeM3: 2 }],
      ["d2", { poidsBrutKg: 300, reference: "D2", statut: "CREE", volumeM3: 1 }],
    ]);
    expect(totalChargeKgFromDossiers(["d1", "d2"], dossiers)).toBe(800);
  });
});

describe("draftToWrite", () => {
  it("maps an empty remorque selection to null", () => {
    const draft = { ...emptyVoyageDraft(), remorqueId: "" };
    expect(draftToWrite(draft, ["dossier-1"]).remorqueId).toBeNull();
  });

  it("keeps a selected remorque id", () => {
    const draft = {
      ...emptyVoyageDraft(),
      remorqueId: "11111111-1111-1111-1111-111111111111",
    };
    expect(draftToWrite(draft, ["dossier-1"]).remorqueId).toBe(
      "11111111-1111-1111-1111-111111111111"
    );
  });

  it("uses dossier weight for the chargement step charge", () => {
    const draft = emptyVoyageDraft();
    const dossiers = new Map([
      [
        "dossier-1",
        {
          id: "dossier-1",
          poidsBrutKg: 750,
          reference: "DT-001",
          statut: "CREE",
          volumeM3: 3,
        },
      ],
    ]);
    const body = draftToWrite(draft, ["dossier-1"], dossiers);
    expect(body.trajet.etapes[0]?.chargeApresKg).toBe(750);
  });
});
