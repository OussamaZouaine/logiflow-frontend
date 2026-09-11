import {
  filterPaletteItems,
  paletteItemsForRoles,
} from "./palette-items";

describe("paletteItemsForRoles", () => {
  it("gives CHAUFFEUR voyages module but no create-voyage action", () => {
    const items = paletteItemsForRoles(["CHAUFFEUR"]);
    const paths = items.map((item) => item.path);

    expect(paths).toContain("/voyages");
    expect(paths).not.toContain("/voyages/nouveau");
    expect(paths).not.toContain("/dossiers/nouveau");
  });

  it("gives EXPLOITANT create actions for planned modules", () => {
    const items = paletteItemsForRoles(["EXPLOITANT"]);
    const paths = items.map((item) => item.path);

    expect(paths).toContain("/sites/nouveau");
    expect(paths).toContain("/dossiers/nouveau");
    expect(paths).toContain("/voyages/nouveau");
  });

  it("limits COMMERCIAL create actions (no voyage plan)", () => {
    const items = paletteItemsForRoles(["COMMERCIAL"]);
    const paths = items.map((item) => item.path);

    expect(paths).toContain("/sites/nouveau");
    expect(paths).toContain("/commandes/nouveau");
    expect(paths).not.toContain("/voyages/nouveau");
    expect(paths).not.toContain("/dossiers/nouveau");
  });

  it("gives ADMINISTRATEUR every module and create action", () => {
    const items = paletteItemsForRoles(["ADMINISTRATEUR"]);
    expect(items.some((item) => item.path === "/utilisateurs/nouveau")).toBe(
      true
    );
    expect(items.some((item) => item.path === "/maintenance/nouveau")).toBe(
      true
    );
  });
});

describe("filterPaletteItems", () => {
  const sample = paletteItemsForRoles(["EXPLOITANT"]);

  it("matches labels and keywords", () => {
    expect(filterPaletteItems(sample, "voy").map((item) => item.path)).toEqual(
      expect.arrayContaining(["/voyages", "/voyages/nouveau"])
    );
    expect(
      filterPaletteItems(sample, "créer site").some(
        (item) => item.path === "/sites/nouveau"
      )
    ).toBe(true);
  });

  it("returns all items for an empty query", () => {
    expect(filterPaletteItems(sample, "  ")).toHaveLength(sample.length);
  });
});
