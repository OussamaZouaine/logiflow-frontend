import { buildFileDuJour } from "./file-du-jour";

describe("buildFileDuJour", () => {
  it("puts brake exceptions before muted waiting work", () => {
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
