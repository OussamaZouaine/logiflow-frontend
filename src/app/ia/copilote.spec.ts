import {
  canSubmitCopiloteQuestion,
  COPILOTE_QUESTION_MAX_LENGTH,
  formatCopiloteConfiance,
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

  it("formats confidence", () => {
    expect(formatCopiloteConfiance(0.82)).toBe("82 %");
    expect(formatCopiloteConfiance(null)).toBeNull();
    expect(formatCopiloteConfiance(undefined)).toBeNull();
  });
});
