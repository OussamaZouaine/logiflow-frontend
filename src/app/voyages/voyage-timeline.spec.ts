import type { EvenementVoyage, Voyage } from "./voyage";
import {
  voyageActualTimelineEntries,
  voyagePlannedTimelineEntries,
} from "./voyage-timeline";

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

describe("voyagePlannedTimelineEntries", () => {
  it("lists départ, arrivée and étapes in time order", () => {
    const entries = voyagePlannedTimelineEntries(sampleVoyage());
    const labels = entries.map((entry) => entry.label);

    expect(labels).toEqual([
      "Départ prévu",
      "Chargement (ETA)",
      "Chargement (ETD)",
      "Arrivée prévue",
      "Déchargement (ETA)",
    ]);
    expect(entries.every((entry) => entry.kind === "planned")).toBe(true);
  });
});

describe("voyageActualTimelineEntries", () => {
  it("lists declared événements by horodatage and skips POSITION", () => {
    const evenements: EvenementVoyage[] = [
      {
        commentaire: "Sur site",
        horodatage: "2026-09-02T11:00:00Z",
        id: "evt-2",
        position: null,
        type: "ARRIVEE_CHARGEMENT",
        voyageId: "55555555-5555-5555-5555-555555555555",
      },
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

    const entries = voyageActualTimelineEntries(evenements);

    expect(entries.map((entry) => entry.label)).toEqual([
      "Départ",
      "Arrivée chargement",
    ]);
    expect(entries.every((entry) => entry.kind === "actual")).toBe(true);
    expect(entries[1]?.detail).toBe("Sur site");
  });

  it("returns an empty list when there are no événements", () => {
    expect(voyageActualTimelineEntries([])).toEqual([]);
  });
});
