import type { OptionVoyage } from "../ia/planification";
import {
  meilleuresValeurs,
  natureArret,
  tauxRemplissage,
} from "../ia/planification";
import { emptyVoyageDraft } from "./voyage";
import {
  draftDepuisProposition,
  projetConformite,
  voyageAEnvoyer,
} from "./voyage-planification";

function option(partiel: Partial<OptionVoyage> = {}): OptionVoyage {
  return {
    alertes: [],
    arrets: [],
    arriveePrevue: "2026-09-27T12:00:00Z",
    chauffeurIds: ["ch-1", "ch-2"],
    conformite: { avertissements: [], bloquants: [], conforme: true },
    departPrevu: "2026-09-27T06:00:00Z",
    dossierIds: ["d-1", "d-2"],
    indicateurs: {
      coutEstime: 900,
      coutParTonne: 90,
      distanceKm: 420,
      dureeConduiteMin: 600,
      dureeTotaleMin: 780,
      fenetresManquees: 0,
      nbDossiers: 2,
      palettes: 20,
      poidsKg: 10_000,
      tauxRemplissagePoids: 0.4,
      tauxRemplissageVolume: 0.6,
      volumeM3: 40,
    },
    justification: "",
    libelleObjectif: "Remplissage maximal",
    objectif: "REMPLISSAGE",
    rang: 1,
    recommandee: true,
    remorqueId: "re-1",
    typeVoyage: "GROUPAGE",
    vehiculeId: "tr-1",
    voyage: {
      affectations: [
        { chauffeurId: "ch-1", dateAffectation: "x", role: "TITULAIRE" },
        { chauffeurId: "ch-2", dateAffectation: "x", role: "RENFORT" },
      ],
      arrets: [{ siteId: "a" }, { siteId: "b" }, { siteId: "c" }],
      arriveePrevue: "2026-09-27T12:00:00Z",
      departPrevu: "2026-09-27T06:00:00Z",
      dossierIds: ["d-1", "d-2"],
      portee: "NATIONAL",
      remorqueId: "re-1",
      trajet: {
        distanceTotaleKm: 420.4,
        dureeConduiteMin: 600,
        dureeTotaleMin: 780,
        etapes: [],
      },
      typeVoyage: "GROUPAGE",
      vehiculeId: "tr-1",
    },
    ...partiel,
  };
}

describe("voyage planification helpers", () => {
  it("prefills the draft with resources, crew and dates of a proposal", () => {
    const draft = draftDepuisProposition(option(), emptyVoyageDraft());

    expect(draft).toMatchObject({
      chauffeurId: "ch-1",
      chauffeurRenfortId: "ch-2",
      distanceTotaleKm: 420,
      dureeConduiteMin: 600,
      remorqueId: "re-1",
      typeVoyage: "GROUPAGE",
      vehiculeId: "tr-1",
    });
    expect(new Date(draft.departPrevu).toISOString()).toBe(
      "2026-09-27T06:00:00.000Z"
    );
  });

  it("keeps the proposal stops only while the dossier selection is unchanged", () => {
    const choisie = option();
    const draft = draftDepuisProposition(choisie, emptyVoyageDraft());

    expect(
      voyageAEnvoyer(draft, ["d-2", "d-1"], new Map(), choisie).arrets
    ).toHaveLength(3);
    expect(
      voyageAEnvoyer(draft, ["d-1"], new Map(), choisie).arrets
    ).toBeUndefined();
    expect(
      voyageAEnvoyer(draft, ["d-1", "d-2"], new Map(), null).arrets
    ).toBeUndefined();
  });

  it("builds no conformity project without dossiers or with inverted dates", () => {
    const draft = emptyVoyageDraft();
    expect(projetConformite(draft, [], null)).toBeNull();
    expect(
      projetConformite(
        { ...draft, arriveePrevue: draft.departPrevu },
        ["d-1"],
        null
      )
    ).toBeNull();
    expect(projetConformite(draft, ["d-1"], null)).toMatchObject({
      affectations: [],
      dossierIds: ["d-1"],
      vehiculeId: null,
    });
  });

  it("computes fill rate, best values and stop nature", () => {
    const a = option();
    const b = option({
      indicateurs: { ...option().indicateurs, coutEstime: 500, nbDossiers: 3 },
      rang: 2,
    });
    expect(tauxRemplissage(a.indicateurs)).toBe(0.6);
    expect(meilleuresValeurs([a, b])).toMatchObject({ cout: 500, dossiers: 3 });
    expect(
      natureArret({ dossiersCharges: ["x"], dossiersDecharges: ["y"] })
    ).toBe("Chargement et déchargement");
  });
});
