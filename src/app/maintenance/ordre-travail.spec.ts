import {
  formatDureeReelleMin,
  formatOrdreShortId,
  typeInterventionLabel,
  vehiculeLabel,
} from "./ordre-travail";

describe("ordre-travail helpers", () => {
  it("formats a compact ordre id", () => {
    expect(formatOrdreShortId("ccccccc0-0000-4000-8000-000000000001")).toBe(
      "000000000001"
    );
  });

  it("formats duration in hours and minutes", () => {
    expect(formatDureeReelleMin(0)).toBe("0 min");
    expect(formatDureeReelleMin(45)).toBe("45 min");
    expect(formatDureeReelleMin(90)).toBe("1 h 30 min");
    expect(formatDureeReelleMin(120)).toBe("2 h");
  });

  it("labels intervention types in French", () => {
    expect(typeInterventionLabel("ENTRETIEN_PREVENTIF")).toBe(
      "Entretien préventif"
    );
  });

  it("resolves vehicule immatriculation from lookups", () => {
    expect(
      vehiculeLabel("33333333-3333-3333-3333-333333333333", [
        {
          id: "33333333-3333-3333-3333-333333333333",
          immatriculation: "AB-123-CD",
        },
      ])
    ).toBe("AB-123-CD");
  });
});
