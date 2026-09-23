import {
  COPILOTE_QUESTION_MAX_LENGTH,
  canSubmitCopiloteQuestion,
  libelleTypeSource,
  routeSource,
} from "./copilote";

describe("copilote helpers", () => {
  it("validates question length", () => {
    expect(canSubmitCopiloteQuestion("")).toBe(false);
    expect(canSubmitCopiloteQuestion("   ")).toBe(false);
    expect(canSubmitCopiloteQuestion("Quels camions sont libres ?")).toBe(true);
    expect(
      canSubmitCopiloteQuestion("x".repeat(COPILOTE_QUESTION_MAX_LENGTH + 1))
    ).toBe(false);
  });

  it("maps cited sources to detail pages", () => {
    expect(
      routeSource({ id: "v-1", reference: "VOY-2026-00003", type: "VOYAGE" })
    ).toBe("/voyages/v-1");
    expect(
      routeSource({ id: "d-1", reference: "DOS-1", type: "DOSSIER" })
    ).toBe("/dossiers/d-1");
    expect(
      routeSource({ id: "c-1", reference: "Jean Dupont", type: "CHAUFFEUR" })
    ).toBeNull();
    expect(
      routeSource({ id: null, reference: "VOY-1", type: "VOYAGE" })
    ).toBeNull();
  });

  it("labels source types", () => {
    expect(libelleTypeSource("VEHICULE")).toBe("Véhicule");
    expect(libelleTypeSource("INCONNU")).toBe("INCONNU");
  });
});
