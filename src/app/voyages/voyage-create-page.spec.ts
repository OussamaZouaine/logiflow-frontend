import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import type { OptionVoyage, PropositionsVoyage } from "../ia/planification";
import { VoyageCreatePage } from "./voyage-create-page";

const EMPTY_PAGE = {
  content: [],
  pageNumber: 0,
  pageSize: 100,
  totalElements: 0,
  totalPages: 0,
};

const RESSOURCES = {
  chauffeurs: [
    {
      categoriesPermis: ["C", "CE"],
      habilitationsValides: ["ADR_BASE"],
      id: "ch-1",
      matricule: "DRV-0001",
      nom: "Martin",
      prenom: "Jean",
    },
  ],
  remorques: [],
  vehicules: [
    {
      carrosserie: null,
      chargeUtileKg: 12_000,
      id: "ve-1",
      immatriculation: "GP-002-BH",
      statut: "DISPONIBLE",
      type: "PORTEUR",
    },
  ],
};

const OPTION: OptionVoyage = {
  alertes: [],
  arrets: [
    {
      attenteMin: 0,
      chargeApresKg: 6000,
      distanceDepuisPrecedentKm: 0,
      dossiersCharges: ["d-1"],
      dossiersDecharges: [],
      dureeDepuisPrecedentMin: 0,
      eta: "2026-09-27T06:00:00Z",
      etd: "2026-09-27T06:45:00Z",
      fenetreRespectee: true,
      latitude: 45.76,
      libelle: "SITE-DEMO-002 — Plateforme Lyon Est",
      longitude: 4.84,
      ordre: 0,
      siteId: "site-lyon",
    },
    {
      attenteMin: 0,
      chargeApresKg: 0,
      distanceDepuisPrecedentKm: 314,
      dossiersCharges: [],
      dossiersDecharges: ["d-1"],
      dureeDepuisPrecedentMin: 270,
      eta: "2026-09-27T11:15:00Z",
      etd: "2026-09-27T12:00:00Z",
      fenetreRespectee: true,
      latitude: 43.3,
      libelle: "SITE-DEMO-003 — Hub Marseille",
      longitude: 5.37,
      ordre: 1,
      siteId: "site-mrs",
    },
  ],
  arriveePrevue: "2026-09-27T12:00:00Z",
  chauffeurIds: ["ch-1"],
  conformite: { avertissements: [], bloquants: [], conforme: true },
  departPrevu: "2026-09-27T06:00:00Z",
  dossierIds: ["d-1"],
  indicateurs: {
    coutEstime: 553,
    coutParTonne: 92,
    distanceKm: 314,
    dureeConduiteMin: 270,
    dureeTotaleMin: 360,
    fenetresManquees: 0,
    nbDossiers: 1,
    palettes: 12,
    poidsKg: 6000,
    tauxRemplissagePoids: 0.5,
    tauxRemplissageVolume: 0.3,
    volumeM3: 24,
  },
  justification: "Remplissage correct sur un trajet direct.",
  libelleObjectif: "Remplissage maximal",
  objectif: "REMPLISSAGE",
  rang: 1,
  recommandee: true,
  remorqueId: null,
  typeVoyage: "SIMPLE",
  vehiculeId: "ve-1",
  voyage: {
    affectations: [
      {
        chauffeurId: "ch-1",
        dateAffectation: "2026-09-27T06:00:00Z",
        role: "TITULAIRE",
      },
    ],
    arrets: [{ siteId: "site-lyon" }, { siteId: "site-mrs" }],
    arriveePrevue: "2026-09-27T12:00:00Z",
    departPrevu: "2026-09-27T06:00:00Z",
    dossierIds: ["d-1"],
    portee: "NATIONAL",
    remorqueId: null,
    trajet: {
      distanceTotaleKm: 314,
      dureeConduiteMin: 270,
      dureeTotaleMin: 360,
      etapes: [
        {
          chargeApresKg: 6000,
          distanceDepuisPrecedenteKm: 0,
          eta: "2026-09-27T06:00:00Z",
          etd: "2026-09-27T06:45:00Z",
          ordre: 0,
          type: "CHARGEMENT",
        },
        {
          chargeApresKg: 0,
          distanceDepuisPrecedenteKm: 314,
          eta: "2026-09-27T11:15:00Z",
          etd: null,
          ordre: 1,
          type: "DECHARGEMENT",
        },
      ],
    },
    typeVoyage: "SIMPLE",
    vehiculeId: "ve-1",
  },
};

const PROPOSITIONS: PropositionsVoyage = {
  comparaison: "Une seule option réalisable.",
  dossiersNonPlanifiables: [],
  libelles: {
    chauffeurs: { "ch-1": "Jean Martin (DRV-0001)" },
    dossiers: { "d-1": "DT-2026-900001" },
    remorques: {},
    vehicules: { "ve-1": "GP-002-BH" },
  },
  nbDossiersCandidats: 1,
  options: [OPTION],
  portee: "NATIONAL",
  sourceDistances: "HAVERSINE",
  sourceRedaction: "GABARIT",
};

interface Page {
  chauffeurSelectOptions: () => readonly { label: string }[];
  choisir: (option: OptionVoyage) => void;
  draft: () => { chauffeurId: string; typeVoyage: string; vehiculeId: string };
  mode: () => string;
  onSubmit: (event: SubmitEvent) => Promise<void>;
  proposer: (event: SubmitEvent) => Promise<void>;
  selectedDossierIds: () => string[];
}

const EVENEMENT = { preventDefault: vi.fn() } as unknown as SubmitEvent;

describe("VoyageCreatePage", () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoyageCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  function flushLookups(): void {
    http.expectOne((req) => req.url === "/api/v1/dossiers").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/sites").flush(EMPTY_PAGE);
    http
      .expectOne((req) => req.url === "/api/v1/voyages/ressources-disponibles")
      .flush(RESSOURCES);
  }

  it("opens in assisted mode and shows the compared proposals", async () => {
    const fixture = TestBed.createComponent(VoyageCreatePage);
    fixture.detectChanges();
    flushLookups();
    const page = fixture.componentInstance as unknown as Page;

    expect(page.mode()).toBe("assiste");
    const envoi = page.proposer(EVENEMENT);
    const req = http.expectOne("/api/v1/ia/planification/propositions");
    expect(req.request.body).toMatchObject({
      nbOptions: 3,
      portee: "NATIONAL",
      typeVoyage: "GROUPAGE",
    });
    req.flush(PROPOSITIONS);
    await envoi;
    fixture.detectChanges();
    for (const geometrie of http.match(
      (r) => r.url === "/api/v1/ia/itineraires/geometrie"
    )) {
      geometrie.flush({ geometrie: [] });
    }
    fixture.detectChanges();

    const texte = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(texte).toContain("Option 1 — Remplissage maximal");
    expect(texte).toContain("Recommandée");
    expect(texte).toContain("DT-2026-900001");
    expect(texte).toContain("Jean Martin (DRV-0001)");
    expect(texte).toContain("Choisir cette proposition");
  });

  it("prefills the manual form from a chosen proposal and submits its stops", async () => {
    const fixture = TestBed.createComponent(VoyageCreatePage);
    fixture.detectChanges();
    flushLookups();
    const page = fixture.componentInstance as unknown as Page;
    const navigate = vi
      .spyOn(TestBed.inject(Router), "navigate")
      .mockResolvedValue(true);

    page.choisir(OPTION);
    fixture.detectChanges();

    expect(page.mode()).toBe("manuel");
    expect(page.selectedDossierIds()).toEqual(["d-1"]);
    expect(page.draft()).toMatchObject({
      chauffeurId: "ch-1",
      typeVoyage: "SIMPLE",
      vehiculeId: "ve-1",
    });
    for (const req of http.match(
      (r) => r.url === "/api/v1/voyages/ressources-disponibles"
    )) {
      req.flush(RESSOURCES);
    }
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 0);
    });
    expect(page.chauffeurSelectOptions()[0]?.label).toBe(
      "DRV-0001 — Jean Martin · C/CE · ADR"
    );
    const conformite = http.expectOne("/api/v1/voyages/conformite");
    expect(conformite.request.body).toMatchObject({
      arrets: [{ siteId: "site-lyon" }, { siteId: "site-mrs" }],
      dossierIds: ["d-1"],
      vehiculeId: "ve-1",
    });
    conformite.flush({
      anomalies: [
        { bloquante: false, code: "FENETRE", message: "Fenêtre hors période" },
      ],
      arrets: [],
      capaciteKg: 12_000,
      chargeMaxKg: 6000,
      conforme: true,
      tauxRemplissage: 0.5,
    });
    await fixture.whenStable();
    fixture.detectChanges();
    const texte = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(texte).toContain("Voyage conforme");
    expect(texte).toContain("Fenêtre hors période");

    const envoi = page.onSubmit(EVENEMENT);
    await fixture.whenStable();
    const creation = http.expectOne(
      (r) => r.url === "/api/v1/voyages" && r.method === "POST"
    );
    expect(creation.request.body.arrets).toEqual([
      { siteId: "site-lyon" },
      { siteId: "site-mrs" },
    ]);
    expect(creation.request.body.trajet.etapes).toHaveLength(2);
    creation.flush({ id: "voy-1" });
    await envoi;

    expect(navigate).toHaveBeenCalledWith(["/voyages", "voy-1"]);
  });

  it("offers manual planning when the agent is unavailable", async () => {
    const fixture = TestBed.createComponent(VoyageCreatePage);
    fixture.detectChanges();
    flushLookups();
    const page = fixture.componentInstance as unknown as Page;

    const envoi = page.proposer(EVENEMENT);
    http.expectOne("/api/v1/ia/planification/propositions").flush(
      {
        detail: "Le service IA (planification) est momentanément indisponible",
      },
      { status: 503, statusText: "Service Unavailable" }
    );
    await envoi;
    fixture.detectChanges();

    const texte = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(texte).toContain("Passer en mode manuel");
  });
});
