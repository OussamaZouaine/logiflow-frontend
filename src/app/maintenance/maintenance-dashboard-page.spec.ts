import {
  parametresOtDepuisRecommandation,
  type RecommandationIA,
  toneStatutIA,
} from "./maintenance-dashboard-page";

const recommandation: RecommandationIA = {
  avantLe: "2026-10-10",
  creneauDebut: "2026-10-02T06:00:00Z",
  creneauFin: "2026-10-02T10:00:00Z",
  dejaPlanifie: false,
  dureeMin: 240,
  justification: "Vidange échue de 1 200 km",
  libelle: "Vidange moteur",
  priorite: "HAUTE",
  type: "ENTRETIEN_PREVENTIF",
};

describe("MaintenanceDashboardPage helpers", () => {
  it("pré-remplit un OT d'origine agent IA sur le créneau proposé", () => {
    expect(
      parametresOtDepuisRecommandation({ vehiculeId: "v1" }, recommandation)
    ).toEqual({
      debut: "2026-10-02T06:00:00Z",
      enginId: "v1",
      fin: "2026-10-02T10:00:00Z",
      justification: "Vidange échue de 1 200 km",
      origine: "AGENT_IA",
      priorite: "HAUTE",
      titre: "Vidange moteur",
      type: "ENTRETIEN_PREVENTIF",
      typeEngin: "VEHICULE",
    });
  });

  it("replie un type ou une priorité inconnus sur des valeurs sûres", () => {
    const params = parametresOtDepuisRecommandation(
      { vehiculeId: "v1" },
      {
        ...recommandation,
        creneauDebut: null,
        creneauFin: null,
        priorite: "???",
        type: "VIDANGE",
      }
    );
    expect(params.type).toBe("ENTRETIEN_PREVENTIF");
    expect(params.priorite).toBeUndefined();
    expect(params.debut).toBeUndefined();
  });

  it("pré-remplit un OT de remorque", () => {
    expect(
      parametresOtDepuisRecommandation(
        { typeEngin: "REMORQUE", vehiculeId: "r1" },
        recommandation
      ).typeEngin
    ).toBe("REMORQUE");
  });

  it("colore les statuts de l'agent", () => {
    expect(toneStatutIA("CRITIQUE")).toBe("brake");
    expect(toneStatutIA("A_PLANIFIER")).toBe("amber");
    expect(toneStatutIA("BON")).toBe("pine");
  });
});
