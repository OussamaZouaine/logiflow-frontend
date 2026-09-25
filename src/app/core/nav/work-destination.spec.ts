import {
  destinationNavGroupsForRoles,
  destinationsForRoles,
} from "./work-destination";

describe("destinationsForRoles", () => {
  it("gives a chauffeur Voyages and Carburant", () => {
    const labels = destinationsForRoles(["CHAUFFEUR"]).map(
      (destination) => destination.label
    );
    expect(labels).toEqual(["Voyages", "Carburant"]);
  });

  it("hides Sites from atelier and includes Maintenance", () => {
    const labels = destinationsForRoles(["ATELIER"]).map(
      (destination) => destination.label
    );
    expect(labels).toEqual(["Véhicules", "Remorques", "Maintenance"]);
  });

  it("gives admin every destination", () => {
    expect(destinationsForRoles(["ADMINISTRATEUR"])).toHaveLength(12);
  });

  it("includes Dossiers for commercial and exploitant", () => {
    expect(
      destinationsForRoles(["COMMERCIAL"]).map((destination) => destination.id)
    ).toContain("dossiers");
    expect(
      destinationsForRoles(["EXPLOITANT"]).map((destination) => destination.id)
    ).toContain("dossiers");
  });

  it("excludes Dossiers from chauffeur", () => {
    const ids = destinationsForRoles(["CHAUFFEUR"]).map(
      (destination) => destination.id
    );
    expect(ids).not.toContain("dossiers");
  });
});

describe("destinationNavGroupsForRoles", () => {
  it("omits empty sections and preserves display order", () => {
    const groups = destinationNavGroupsForRoles(["CHAUFFEUR"]);
    expect(groups.map((g) => g.section)).toEqual(["Exploitation", "Planning"]);
    expect(groups.flatMap((g) => g.items.map((d) => d.id))).toEqual([
      "carburant",
      "voyages",
    ]);
  });

  it("groups admin destinations by section without duplicates", () => {
    const groups = destinationNavGroupsForRoles(["ADMINISTRATEUR"]);
    const flatIds = groups.flatMap((g) => g.items.map((d) => d.id));
    expect(flatIds).toHaveLength(12);
    expect(new Set(flatIds).size).toBe(12);
    expect(groups[0].section).toBe("Référentiel");
  });
});
