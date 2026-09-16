import {
  chauffeurLabelFromLookup,
  formatChauffeurLabel,
  formatChauffeurNomComplet,
} from "./chauffeur";

describe("chauffeur helpers", () => {
  it("formats nom complet from nom and prenom", () => {
    expect(formatChauffeurNomComplet("Martin", "Jean")).toBe("Jean Martin");
  });

  it("formats list label with matricule", () => {
    expect(
      formatChauffeurLabel({
        matricule: "CH-001",
        nom: "Martin",
        prenom: "Jean",
      })
    ).toBe("CH-001 — Jean Martin");
  });

  it("falls back to id when lookup misses", () => {
    expect(
      chauffeurLabelFromLookup("missing-id", new Map())
    ).toBe("missing-id");
  });
});
