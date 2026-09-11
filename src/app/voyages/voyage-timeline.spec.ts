import type { EvenementVoyage, Voyage } from "./voyage";
import { voyageTimelineEntries } from "./voyage-timeline";

function sampleVoyage(overrides: Partial<Voyage> = {}): Voyage {
  return {
    affectations: [
      {
        chauffeurId: "66666666-6666-6666-6666-666666666666",
        dateAffectation: "2026-09-01T10:00:00Z",
        role: "TITULAIRE",
      },
    ],
    arriveePrevue: "2026-09-02T16:00:00Z",
    departPrevu: "2026-09-02T08:00:00Z",
    dossierIds: ["44444444-4444-4444-4444-444444444444"],
    id: "55555555-5555-5555-5555-555555555555",
    portee: "NATIONAL",
    reference: "VOY-2026-00001",
    remorqueId: null,
    statut: "PLANIFIE",
    tauxRemplissage: 0.5,
    trajet: {
      distanceTotaleKm: 450,
      dureeConduiteMin: 360,
      dureeTotaleMin: 420,
      etapes: [
        {
          chargeApresKg: 500,
          distanceDepuisPrecedenteKm: 0,
          eta: "2026-09-02T08:00:00Z",
          etd: "2026-09-02T08:00:00Z",
          ordre: 0,
          type: "CHARGEMENT",
        },
        {
          chargeApresKg: 0,
          distanceDepuisPrecedenteKm: 450,
          eta: "2026-09-02T16:00:00Z",
          etd: null,
          ordre: 1,
          type: "DECHARGEMENT",
        },
      ],
    },
    typeVoyage: "SIMPLE",
    vehiculeId: "33333333-3333-3333-3333-333333333333",
    ...overrides,
  };
}

describe("voyageTimelineEntries", () => {
  it("merges planned steps, affectations and événements in time order", () => {
    const evenements: EvenementVoyage[] = [
      {
        commentaire: null,
        horodatage: "2026-09-02T09:00:00Z",
        id: "evt-1",
        position: null,
        type: "DEPART",
        voyageId: "55555555-5555-5555-5555-555555555555",
      },
      {
        commentaire: "ping",
        horodatage: "2026-09-02T10:00:00Z",
        id: "evt-pos",
        position: { latitude: 48.8, longitude: 2.3 },
        type: "POSITION",
        voyageId: "55555555-5555-5555-5555-555555555555",
      },
    ];

    const entries = voyageTimelineEntries(sampleVoyage(), evenements);
    const labels = entries.map((entry) => entry.label);

    expect(labels).toContain("Départ prévu");
    expect(labels).toContain("Affectation · Titulaire");
    expect(labels).toContain("Départ");
    expect(labels.indexOf("Affectation · Titulaire")).toBeLessThan(
      labels.indexOf("Départ prévu")
    );
    expect(labels.some((label) => label.toLowerCase().includes("position"))).toBe(
      false
    );
    expect(entries.at(-1)?.kind).toBe("state");
    expect(entries.at(-1)?.detail).toBe("Planifié");
  });

  it("still returns statut state when voyage has no evenements", () => {
    const entries = voyageTimelineEntries(
      sampleVoyage({ affectations: [] }),
      []
    );
    expect(entries.some((entry) => entry.kind === "planned")).toBe(true);
    expect(entries.at(-1)?.kind).toBe("state");
  });
});
