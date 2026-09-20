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

  it("maps draft to write payload aligned with RemorqueRequest", () => {
    const draft = emptyRemorqueDraft();
    draft.immatriculation = "ab-123-cd";
    draft.marque = "Schmitz";
    draft.modele = "";
    draft.numeroParc = "R-001";
    draft.groupeFroid = true;
    draft.temperatureMin = -20;
    draft.temperatureMax = 5;
    draft.dateAcquisition = "2024-06-15";

    expect(draftToWrite(draft)).toEqual({
      anneeFabrication: null,
      carrosserie: "TAUTLINER",
      chargeUtileKg: 24_000,
      dateAcquisition: "2024-06-15",
      dateMiseEnService: null,
      datePremiereMiseCirculation: null,
      groupeFroid: true,
      hauteurM: null,
      immatriculation: "AB-123-CD",
      largeurM: null,
      longueurM: null,
      marque: "Schmitz",
      modele: null,
      nbPositionsPalettes: 33,
      numeroParc: "R-001",
      poidsVideKg: null,
      temperatureMax: 5,
      temperatureMin: -20,
      type: "SEMI_REMORQUE",
      vin: null,
      volumeUtileM3: 0,
    });
  });

  it("computes volume from dimensions in draftToWrite", () => {
    const draft = emptyRemorqueDraft();
    draft.longueurM = 13.6;
    draft.largeurM = 2.45;
    draft.hauteurM = 2.7;

    expect(draftToWrite(draft).volumeUtileM3).toBe(89.96);
  });
});
