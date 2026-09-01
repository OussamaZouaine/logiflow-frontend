import { destinationsForRoles } from "./work-destination";

describe("destinationsForRoles", () => {
  it("gives a chauffeur Voyages only", () => {
    const labels = destinationsForRoles(["CHAUFFEUR"]).map(
      (destination) => destination.label
    );
    expect(labels).toEqual(["Voyages"]);
  });

  it("hides Sites from atelier and includes Maintenance", () => {
    const labels = destinationsForRoles(["ATELIER"]).map(
      (destination) => destination.label
    );
    expect(labels).toEqual(["Véhicules", "Maintenance"]);
  });

  it("gives admin every destination", () => {
    expect(destinationsForRoles(["ADMINISTRATEUR"])).toHaveLength(6);
  });
});
