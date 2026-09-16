import {
  canSuggererGroupage,
  dossierReferencesForIds,
  formatPropositionGainKm,
  formatPropositionScore,
  groupageCandidateIds,
  propositionSourceLabel,
} from "./groupage";

describe("groupage helpers", () => {
  const dossiers = [
    { groupable: true, id: "a", statut: "CREE" as const },
    { groupable: true, id: "b", statut: "CREE" as const },
    { groupable: false, id: "c", statut: "CREE" as const },
    { groupable: true, id: "d", statut: "PLANIFIE" as const },
  ];

  it("filters groupable CREE dossiers for suggestions", () => {
    expect(groupageCandidateIds(dossiers)).toEqual(["a", "b"]);
    expect(canSuggererGroupage(dossiers)).toBe(true);
    expect(canSuggererGroupage([dossiers[2]!])).toBe(false);
  });

  it("formats proposition labels", () => {
    expect(formatPropositionScore(0.82)).toBe("82 %");
    expect(formatPropositionScore(null)).toBe("—");
    expect(formatPropositionScore(undefined)).toBe("—");
    expect(formatPropositionGainKm(125.4)).toBe("125 km");
    expect(formatPropositionGainKm(null)).toBeNull();
    expect(propositionSourceLabel(true)).toBe("IA");
    expect(propositionSourceLabel(false)).toBe("Repli");
  });

  it("resolves dossier references for display", () => {
    const byId = new Map([
      ["a", { reference: "DOS-001" }],
      ["b", { reference: "DOS-002" }],
    ]);
    expect(dossierReferencesForIds(["a", "b"], byId)).toEqual([
      "DOS-001",
      "DOS-002",
    ]);
  });
});
