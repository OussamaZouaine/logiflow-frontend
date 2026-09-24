import {
  alertesChauffeur,
  type Chauffeur,
  chauffeurLabelFromLookup,
  chauffeurToDraft,
  draftToCreate,
  draftToUpdate,
  emptyChauffeurDraft,
  erreurHabilitation,
  etatValidite,
  formatChauffeurLabel,
  formatChauffeurNomComplet,
  formatSoldeConduite,
  habilitationsValides,
} from "./chauffeur";

const AUJOURDHUI = new Date("2026-09-24T10:00:00Z");

function chauffeur(partiel: Partial<Chauffeur> = {}): Chauffeur {
  return {
    adresse: null,
    categoriesPermis: ["C", "CE"],
    cin: null,
    dateDelivrancePasseport: null,
    dateDelivranceVisa: null,
    dateEmbauche: null,
    dateExpirationPasseport: null,
    dateExpirationPermis: "2030-01-01",
    dateExpirationVisa: null,
    dateNaissance: null,
    dateObtentionPermis: null,
    disponibilite: "DISPONIBLE",
    email: null,
    experienceAnnees: 8,
    habilitations: [],
    id: "c1",
    lieuNaissance: null,
    matricule: "DRV-0001",
    nationalite: null,
    nom: "Martin",
    numeroPasseport: null,
    numeroPermis: "P-1",
    numeroVisa: null,
    paysDelivrancePasseport: null,
    paysVisa: null,
    prenom: "Jean",
    siteRattachementId: "s1",
    soldeTempsConduiteMinutes: 2257,
    specialisation: null,
    statut: "ACTIF",
    telephone: "0600000000",
    typeContrat: "CDI",
    typeVisa: null,
    ...partiel,
  };
}

describe("chauffeur helpers", () => {
  it("formats names and labels", () => {
    expect(formatChauffeurNomComplet("Martin", "Jean")).toBe("Jean Martin");
    expect(
      formatChauffeurLabel({
        matricule: "CH-001",
        nom: "Martin",
        prenom: "Jean",
      })
    ).toBe("CH-001 — Jean Martin");
    expect(chauffeurLabelFromLookup("missing-id", new Map())).toBe(
      "missing-id"
    );
    expect(formatSoldeConduite(2257)).toBe("37 h 37");
  });

  it("classifies expiry dates", () => {
    expect(etatValidite(null, AUJOURDHUI)).toBe("absent");
    expect(etatValidite("2026-09-23", AUJOURDHUI)).toBe("expire");
    expect(etatValidite("2026-10-10", AUJOURDHUI)).toBe("bientot");
    expect(etatValidite("2027-06-01", AUJOURDHUI)).toBe("valide");
  });

  it("lists pieces to renew and valid habilitations", () => {
    const c = chauffeur({
      dateExpirationPermis: "2026-10-01",
      habilitations: [
        {
          dateExpiration: "2029-01-01",
          dateObtention: "2024-01-01",
          reference: "A",
          type: "ADR_BASE",
        },
        {
          dateExpiration: "2026-01-01",
          dateObtention: "2021-01-01",
          reference: "V",
          type: "VISITE_MEDICALE",
        },
      ],
    });

    expect(alertesChauffeur(c, AUJOURDHUI)).toEqual([
      { libelle: "Permis de conduire", niveau: "bientot" },
      { libelle: "Visite médicale", niveau: "expire" },
    ]);
    expect(habilitationsValides(c.habilitations, AUJOURDHUI)).toEqual([
      "ADR_BASE",
    ]);
  });

  it("round-trips a chauffeur through the form draft", () => {
    const draft = chauffeurToDraft(chauffeur());
    expect(draft.soldeTempsConduiteHeures).toBe(37.6);
    expect(draft.categoriesPermis).toEqual(["C", "CE"]);

    const maj = draftToUpdate({ ...draft, email: "  ", prenom: " Paul " });
    expect(maj.prenom).toBe("Paul");
    expect(maj.profil.email).toBeNull();
    expect(maj.profil.telephone).toBe("0600000000");
    expect(maj.profil.siteRattachementId).toBe("s1");
  });

  it("builds a creation payload with normalised matricule and minutes", () => {
    const creation = draftToCreate({
      ...emptyChauffeurDraft(),
      matricule: " drv-42 ",
      nom: "Durand",
      prenom: "Luc",
      siteRattachementId: "__none__",
      soldeTempsConduiteHeures: 45.5,
      typeContrat: "__none__",
    });

    expect(creation.matricule).toBe("DRV-42");
    expect(creation.soldeTempsConduiteInitialMinutes).toBe(2730);
    expect(creation.profil.siteRattachementId).toBeNull();
    expect(creation.profil.typeContrat).toBeNull();
    expect(creation.profil.categoriesPermis).toEqual(["B", "C", "CE"]);
  });

  it("validates habilitation rows", () => {
    const ok = {
      dateExpiration: "2029-01-01",
      dateObtention: "2024-01-01",
      reference: "R",
      type: "FIMO_FCO" as const,
    };
    expect(erreurHabilitation(ok)).toBeNull();
    expect(erreurHabilitation({ ...ok, reference: " " })).toContain(
      "référence"
    );
    expect(
      erreurHabilitation({ ...ok, dateExpiration: "2023-01-01" })
    ).toContain("suivre");
  });
});
