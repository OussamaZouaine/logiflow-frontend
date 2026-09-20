import {
  draftToWrite,
  emptyPlanEntretienDraft,
  formatPeriodicite,
  hasPlanPeriodicite,
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
      vehiculeId: "11111111-1111-1111-1111-111111111111",
      libelle: "Vidange moteur",
      periodiciteKm: 30_000,
      periodiciteMois: 12,
      seuilAlerteKm: 500,
      dureeEstimeeMin: 60,
    });
  });

  it("sends null for non-positive periodicities (PlanEntretienRequest shape)", () => {
    const draft = emptyPlanEntretienDraft();
    draft.libelle = "Contrôle";
    draft.vehiculeId = "11111111-1111-1111-1111-111111111111";
    draft.periodiciteKm = 0;
    draft.periodiciteMois = 6;

    expect(draftToWrite(draft)).toEqual({
      vehiculeId: "11111111-1111-1111-1111-111111111111",
      libelle: "Contrôle",
      periodiciteKm: null,
      periodiciteMois: 6,
      seuilAlerteKm: 500,
      dureeEstimeeMin: 60,
    });
  });

  it("requires at least one positive periodicity", () => {
    expect(hasPlanPeriodicite(30_000, 12)).toBe(true);
    expect(hasPlanPeriodicite(30_000, null)).toBe(true);
    expect(hasPlanPeriodicite(null, 12)).toBe(true);
    expect(hasPlanPeriodicite(0, 0)).toBe(false);
    expect(hasPlanPeriodicite(null, null)).toBe(false);
  });
});
