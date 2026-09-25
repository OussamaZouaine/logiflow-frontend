import { avecParts, bornesPeriode } from "./couts-page";

describe("CoutsPage helpers", () => {
  const aujourdHui = new Date(2026, 8, 25);

  it("calcule les bornes des périodes", () => {
    expect(bornesPeriode("MOIS", aujourdHui)).toEqual({
      debut: "2026-09-01",
      fin: "2026-09-25",
    });
    expect(bornesPeriode("TRIMESTRE", aujourdHui)).toEqual({
      debut: "2026-07-01",
      fin: "2026-09-25",
    });
    expect(bornesPeriode("ANNEE_CIVILE", aujourdHui)).toEqual({
      debut: "2026-01-01",
      fin: "2026-09-25",
    });
    expect(bornesPeriode("DOUZE_MOIS", aujourdHui)).toEqual({
      debut: "2025-09-26",
      fin: "2026-09-25",
    });
  });

  it("proportionne les barres au plus gros poste", () => {
    const parts = avecParts([
      { cle: "A", libelle: "A", nombre: 1, totalHt: 200 },
      { cle: "B", libelle: "B", nombre: 1, totalHt: 50 },
    ]);
    expect(parts.map((p) => p.part)).toEqual([100, 25]);
    expect(
      avecParts([{ cle: "Z", libelle: "Z", nombre: 0, totalHt: 0 }])[0]?.part
    ).toBe(0);
  });
});
