import type { Dossier } from "../dossiers/dossier";
import type { Site } from "../sites/site";
import { isValidLocalisation } from "../sites/site-localisation";
import type { Voyage } from "./voyage";
import { voyageSiteMarkers } from "./voyage-sites-map-markers";

describe("voyageSiteMarkers", () => {
  const siteChargement: Site = {
    actif: true,
    adresse: null,
    clientId: null,
    code: "SITE-PARIS",
    contraintesAcces: null,
    id: "site-chargement",
    libelle: "Paris Nord",
    localisation: { latitude: 48.86, longitude: 2.35 },
  };

  const siteDechargement: Site = {
    actif: true,
    adresse: null,
    clientId: null,
    code: "SITE-LYON",
    contraintesAcces: null,
    id: "site-dechargement",
    libelle: "Lyon Sud",
    localisation: { latitude: 45.75, longitude: 4.85 },
  };

  const dossier: Dossier = {
    carrosserieRequise: null,
    commandeId: "cmd-1",
    contientAdr: false,
    documents: [],
    familleMarchandise: "GENERAL",
    groupable: true,
    id: "dossier-1",
    lignesMarchandise: [],
    nbPalettes: 0,
    poidsBrutKg: 1000,
    reference: "DOS-1",
    segments: [
      {
        fenetre: { debut: "2026-09-01T08:00:00Z", fin: "2026-09-01T10:00:00Z" },
        ordre: 1,
        realiseLe: null,
        siteId: "site-chargement",
        type: "CHARGEMENT",
      },
      {
        fenetre: { debut: "2026-09-01T16:00:00Z", fin: "2026-09-01T18:00:00Z" },
        ordre: 2,
        realiseLe: null,
        siteId: "site-dechargement",
        type: "DECHARGEMENT",
      },
    ],
    statut: "PLANIFIE",
    temperatureRequise: null,
    typeTransport: "NATIONAL",
    volumeM3: 10,
  };

  const voyage: Voyage = {
    affectations: [],
    arriveePrevue: "2026-09-01T18:00:00Z",
    departPrevu: "2026-09-01T08:00:00Z",
    dossierIds: ["dossier-1"],
    id: "voyage-1",
    portee: "NATIONAL",
    reference: "VOY-1",
    remorqueId: null,
    statut: "PLANIFIE",
    tauxRemplissage: 0.5,
    trajet: {
      distanceTotaleKm: 450,
      dureeConduiteMin: 360,
      dureeTotaleMin: 420,
      etapes: [],
    },
    typeVoyage: "SIMPLE",
    vehiculeId: "vehicule-1",
  };

  it("returns unique geolocated sites for a voyage", () => {
    const markers = voyageSiteMarkers(
      voyage,
      new Map([["dossier-1", dossier]]),
      new Map([
        ["site-chargement", siteChargement],
        ["site-dechargement", siteDechargement],
      ])
    );

    expect(markers).toHaveLength(2);
    expect(markers[0]?.label).toContain("Chargement");
    expect(markers[0]?.label).toContain("SITE-PARIS");
    expect(markers[1]?.label).toContain("Déchargement");
    expect(
      isValidLocalisation(markers[1]!.latitude, markers[1]!.longitude)
    ).toBe(true);
  });

  it("returns an empty list when the voyage has no resolvable sites", () => {
    expect(voyageSiteMarkers(voyage, new Map(), new Map())).toEqual([]);
    expect(voyageSiteMarkers(null, new Map(), new Map())).toEqual([]);
  });
});
