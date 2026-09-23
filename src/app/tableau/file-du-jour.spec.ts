import {
  buildFileDuJour,
  fileDuJourBadgeLabel,
  fileDuJourIcon,
  fileDuJourSummary,
  fileDuJourToneCounts,
  groupFileDuJourByTone,
} from "./file-du-jour";

describe("buildFileDuJour", () => {
  it("puts brake exceptions before amber at-risk work", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["dossiers", "commandes"]),
      commandes: [{ statut: "RECUE" }, { statut: "RECUE" }],
      dossiers: [{ statut: "INCIDENT" }, { statut: "CREE" }],
      prisesCarburant: null,
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

  it("includes carburant brouillons when the module is allowed", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["carburant"]),
      commandes: null,
      dossiers: null,
      prisesCarburant: [
        { statut: "BROUILLON" },
        { statut: "BROUILLON" },
        { statut: "VALIDEE" },
      ],
      vehicules: null,
      voyages: null,
    });

    expect(items).toEqual([
      expect.objectContaining({
        count: 2,
        id: "prises-brouillon",
        path: "/carburant",
      }),
    ]);
  });

  it("omits modules the role cannot open", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["voyages"]),
      commandes: [{ statut: "RECUE" }],
      dossiers: [{ statut: "INCIDENT" }],
      prisesCarburant: null,
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
      prisesCarburant: [{ statut: "VALIDEE" }],
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
      prisesCarburant: null,
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

describe("groupFileDuJourByTone", () => {
  it("groups consecutive items by tone and marks lower tiers compact", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["dossiers", "commandes", "voyages"]),
      commandes: [{ statut: "RECUE" }, { statut: "RECUE" }],
      dossiers: [
        { statut: "INCIDENT" },
        { statut: "CREE" },
        { statut: "EN_TRANSIT" },
      ],
      prisesCarburant: null,
      vehicules: null,
      voyages: [{ statut: "PLANIFIE" }, { statut: "AFFECTE" }],
    });

    expect(groupFileDuJourByTone(items).map((tier) => tier.tone)).toEqual([
      "brake",
      "amber",
      "pine",
      "muted",
    ]);
    expect(groupFileDuJourByTone(items).map((tier) => tier.compact)).toEqual([
      false,
      false,
      true,
      true,
    ]);
  });
});

describe("fileDuJourToneCounts", () => {
  it("sums item counts per urgency tier", () => {
    const items = buildFileDuJour({
      allowedIds: new Set(["dossiers", "commandes"]),
      commandes: [{ statut: "RECUE" }, { statut: "RECUE" }],
      dossiers: [{ statut: "INCIDENT" }],
      prisesCarburant: null,
      vehicules: null,
      voyages: null,
    });

    expect(fileDuJourToneCounts(items)).toEqual([
      { count: 1, label: "Priorité", tone: "brake" },
      { count: 2, label: "À risque", tone: "amber" },
    ]);
  });
});

describe("fileDuJourIcon", () => {
  it("maps module paths to shell icons", () => {
    expect(fileDuJourIcon("/vehicules")).toBe("lucideTruck");
    expect(fileDuJourIcon("/unknown")).toBe("lucideInbox");
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
