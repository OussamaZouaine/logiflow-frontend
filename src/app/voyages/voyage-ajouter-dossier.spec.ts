import {
  capaciteAjoutDossierMessage,
  deviationAjoutDossierMessage,
} from "./voyage-ajouter-dossier";

describe("voyage-ajouter-dossier messages", () => {
  it("formats deviation feedback", () => {
    expect(
      deviationAjoutDossierMessage({
        detourKm: 12.3,
        detourPercent: 31.2,
        maxAllowedPercent: 25,
        point: "pickup",
      })
    ).toContain("12.3 km");
  });

  it("formats capacity feedback", () => {
    expect(
      capaciteAjoutDossierMessage([
        {
          arretArriveeId: "b",
          arretDepartId: "a",
          depassementKg: 500,
          depassementM3: null,
          motif: "weight",
        },
      ])
    ).toContain("500");
  });
});
