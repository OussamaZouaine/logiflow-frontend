import { filterByStatut, statutOptionsFrom } from "./list-filter";

describe("filterByStatut", () => {
  const rows = [
    { id: "1", statut: "CREE" },
    { id: "2", statut: "INCIDENT" },
    { id: "3", statut: "CREE" },
  ];

  it("returns all rows when no statut is selected", () => {
    expect(filterByStatut(rows, null, (row) => row.statut)).toEqual(rows);
  });

  it("keeps only matching statut", () => {
    expect(filterByStatut(rows, "CREE", (row) => row.statut)).toEqual([
      { id: "1", statut: "CREE" },
      { id: "3", statut: "CREE" },
    ]);
  });
});

describe("statutOptionsFrom", () => {
  it("maps values to labeled options", () => {
    expect(
      statutOptionsFrom(["A", "B"] as const, (value) => `L-${value}`)
    ).toEqual([
      { label: "L-A", value: "A" },
      { label: "L-B", value: "B" },
    ]);
  });
});
