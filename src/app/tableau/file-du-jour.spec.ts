import {
  buildFileDuJour,
  fileDuJourBadgeLabel,
  fileDuJourSummary,
} from "./file-du-jour";

describe("buildFileDuJour", () => {
  it("puts brake exceptions before amber at-risk work", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["dossiers", "commandes"]),
      commandes: [{ statut: "RECUE" }, { statut: "RECUE" }],
      dossiers: [{ statut: "INCIDENT" }, { statut: "CREE" }],
      vehicules: null,
      voyages: null,
    });

    expect(items.map((item) => item.id)).toEqual([
      "dossiers-incident",
      "commandes-recue",
      "dossiers-creer",
    ]);
    expect(items[0]?.tone).toBe("brake");
    expect(items[0]?.count).toBe(1);
    expect(items[1]?.tone).toBe("amber");
  });

  it("omits modules the role cannot open", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["voyages"]),
      commandes: [{ statut: "RECUE" }],
      dossiers: [{ statut: "INCIDENT" }],
      vehicules: [{ statut: "IMMOBILISE" }],
      voyages: [{ statut: "EN_COURS" }],
    });

    expect(items.map((item) => item.id)).toEqual(["voyages-en-cours"]);
  });

  it("returns an empty list when nothing needs attention", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["dossiers", "voyages", "commandes", "vehicules"]),
      commandes: [{ statut: "CONFIRMEE" }],
      dossiers: [{ statut: "CLOTURE" }],
      vehicules: [{ statut: "DISPONIBLE" }],
      voyages: [{ statut: "TERMINE" }],
    });

    expect(items).toEqual([]);
  });
});

describe("fileDuJourSummary", () => {
  it("sums counts and keeps the highest-priority tone", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["dossiers", "commandes"]),
      commandes: [{ statut: "RECUE" }, { statut: "RECUE" }],
      dossiers: [{ statut: "INCIDENT" }],
      vehicules: null,
      voyages: null,
    });

    expect(fileDuJourSummary(items)).toEqual({
      categoryCount: 2,
      topTone: "brake",
      totalCount: 3,
    });
  });

  it("returns zeros for an empty queue", () => {
    expect(fileDuJourSummary([])).toEqual({
      categoryCount: 0,
      topTone: null,
      totalCount: 0,
    });
  });
});

describe("fileDuJourBadgeLabel", () => {
  it("describes the total for screen readers", () => {
    expect(
      fileDuJourBadgeLabel({
        categoryCount: 2,
        topTone: "brake",
        totalCount: 3,
      })
    ).toBe("3 éléments dans la file du jour — ouvrir le tableau de bord");
  });
});
