import {
  draftToWrite,
  emptyPlanEntretienDraft,
  formatPeriodicite,
} from "./plan-entretien";

describe("plan entretien helpers", () => {
  it("formats periodicite from km and months", () => {
    const label = formatPeriodicite({
      dureeEstimeeMin: 60,
      id: "1",
      libelle: "Vidange",
      periodiciteKm: 30_000,
      periodiciteMois: 12,
      seuilAlerteKm: 500,
      vehiculeId: "v1",
    });
    expect(label).toContain("12 mois");
    expect(label).toContain("km");
  });

  it("maps draft to write payload", () => {
    const draft = emptyPlanEntretienDraft();
    draft.libelle = "  Vidange moteur ";
    draft.vehiculeId = "11111111-1111-1111-1111-111111111111";

    expect(draftToWrite(draft)).toEqual({
      dureeEstimeeMin: 60,
      libelle: "Vidange moteur",
      periodiciteKm: 30_000,
      periodiciteMois: 12,
      seuilAlerteKm: 500,
      vehiculeId: "11111111-1111-1111-1111-111111111111",
    });
  });
});
