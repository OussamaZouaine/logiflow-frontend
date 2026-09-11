import type { Dossier } from "./dossier";
import { dossierTimelineEntries } from "./dossier-timeline";

function sampleDossier(overrides: Partial<Dossier> = {}): Dossier {
  return {
    carrosserieRequise: null,
    commandeId: "11111111-1111-1111-1111-111111111111",
    contientAdr: false,
    documents: [],
    familleMarchandise: "GENERAL",
    groupable: true,
    id: "22222222-2222-2222-2222-222222222222",
    lignesMarchandise: [],
    nbPalettes: 10,
    poidsBrutKg: 1000,
    reference: "DT-2026-00001",
    segments: [
      {
        fenetre: {
          debut: "2026-09-02T08:00:00Z",
          fin: "2026-09-02T10:00:00Z",
        },
        ordre: 1,
        realiseLe: null,
        siteId: "site-paris",
        type: "CHARGEMENT",
      },
      {
        fenetre: {
          debut: "2026-09-02T14:00:00Z",
          fin: "2026-09-02T16:00:00Z",
        },
        ordre: 2,
        realiseLe: "2026-09-02T15:30:00Z",
        siteId: "site-lyon",
        type: "DECHARGEMENT",
      },
    ],
    statut: "EN_TRANSIT",
    temperatureRequise: null,
    typeTransport: "NATIONAL",
    volumeM3: 12,
    ...overrides,
  };
}

describe("dossierTimelineEntries", () => {
  it("lists fenêtres, realised segments, then current statut", () => {
    const entries = dossierTimelineEntries(sampleDossier());
    const labels = entries.map((entry) => entry.label);

    expect(labels).toContain("Chargement · ouverture fenêtre");
    expect(labels).toContain("Déchargement réalisé");
    expect(entries.at(-1)?.kind).toBe("state");
    expect(entries.at(-1)?.detail).toBe("En transit");
  });
});
