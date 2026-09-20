import {
  formatIsoForDisplay,
  isoToLocalDate,
  parseTypedDateToIso,
  toIsoDateInput,
} from "./iso-date";

describe("iso-date helpers", () => {
  it("formats ISO dates for French display", () => {
    expect(formatIsoForDisplay("2026-09-25")).toBe("25/09/2026");
  });

  it("parses slash and ISO typed dates", () => {
    expect(parseTypedDateToIso("25/09/2026")).toBe("2026-09-25");
    expect(parseTypedDateToIso("2026-09-25")).toBe("2026-09-25");
  });

  it("rejects invalid calendar dates", () => {
    expect(parseTypedDateToIso("31/02/2026")).toBeNull();
  });

  it("round-trips through local date", () => {
    const date = new Date(2026, 8, 25);
    expect(toIsoDateInput(date)).toBe("2026-09-25");
    expect(isoToLocalDate("2026-09-25")?.getDate()).toBe(25);
  });
});
