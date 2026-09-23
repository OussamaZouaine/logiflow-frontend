import { destinationsForRoles } from "./work-destination";

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
    expect(destinationsForRoles(["ADMINISTRATEUR"])).toHaveLength(11);
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
