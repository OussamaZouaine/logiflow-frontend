import {
  capaciteTronconTone,
  capaciteTronconToneClass,
  tronconParDepart,
} from "./voyage-capacite";

describe("voyage-capacite", () => {
  it("maps fullness percentages to tones", () => {
    expect(capaciteTronconTone(50)).toBe("pine");
    expect(capaciteTronconTone(70)).toBe("amber");
    expect(capaciteTronconTone(90)).toBe("brake");
  });

  it("maps tones to tailwind classes", () => {
    expect(capaciteTronconToneClass("pine")).toBe("bg-pine");
    expect(capaciteTronconToneClass("amber")).toBe("bg-amber");
    expect(capaciteTronconToneClass("brake")).toBe("bg-brake");
  });

  it("finds a leg by departure stop id", () => {
    const troncon = tronconParDepart(
      [
        {
          arretArriveeId: "b",
          arretDepartId: "a",
          indiceTroncon: 0,
          poidsUtiliseKg: 500,
          pourcentageMax: 10,
          pourcentagePoids: 10,
          pourcentageVolume: 5,
          volumeUtiliseM3: 2,
        },
      ],
      "a"
    );
    expect(troncon?.arretArriveeId).toBe("b");
  });
});
