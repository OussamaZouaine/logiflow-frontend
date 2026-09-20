import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { VoyageCreatePage } from "./voyage-create-page";

const EMPTY_PAGE = {
  content: [],
  pageNumber: 0,
  pageSize: 50,
  totalElements: 0,
  totalPages: 0,
};

describe("VoyageCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoyageCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

    it("renders chauffeur names from nom and prenom", async () => {
    const fixture = TestBed.createComponent(VoyageCreatePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne((req) => req.url === "/api/v1/vehicules").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/dossiers").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/sites").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/remorques").flush(EMPTY_PAGE);
    http
      .expectOne((req) => req.url === "/api/v1/chauffeurs")
      .flush({
        content: [
          {
            disponibilite: "DISPONIBLE",
            id: "66666666-6666-6666-6666-666666666666",
            matricule: "CH-001",
            nom: "Martin",
            prenom: "Jean",
            statut: "ACTIF",
          },
        ],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 1,
        totalPages: 1,
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const page = fixture.componentInstance as unknown as {
      chauffeurSelectOptions: () => readonly { label: string }[];
    };
    expect(compiled.textContent).toContain("Nouveau voyage");
    expect(page.chauffeurSelectOptions()[0]?.label).toBe("CH-001 — Jean Martin");
    expect(compiled.querySelector("#vehiculeId")).toBeTruthy();
    expect(compiled.textContent).toContain("Calculer via IA");
    expect(compiled.textContent).toContain("Suggérer un groupage");
    http.verify();
  });

  it("calls IA groupage and applies a proposition", async () => {
    const fixture = TestBed.createComponent(VoyageCreatePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne((req) => req.url === "/api/v1/vehicules").flush(EMPTY_PAGE);
    http
      .expectOne((req) => req.url === "/api/v1/dossiers")
      .flush({
        content: [
          {
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
            segments: [],
            statut: "CREE",
            temperatureRequise: null,
            typeTransport: "NATIONAL",
            volumeM3: 10,
          },
          {
            carrosserieRequise: null,
            commandeId: "cmd-2",
            contientAdr: false,
            documents: [],
            familleMarchandise: "GENERAL",
            groupable: true,
            id: "dossier-2",
            lignesMarchandise: [],
            nbPalettes: 0,
            poidsBrutKg: 800,
            reference: "DOS-2",
            segments: [],
            statut: "CREE",
            temperatureRequise: null,
            typeTransport: "NATIONAL",
            volumeM3: 8,
          },
        ],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 2,
        totalPages: 1,
      });
    http.expectOne((req) => req.url === "/api/v1/sites").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/remorques").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/chauffeurs").flush(EMPTY_PAGE);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const suggestButton = Array.from(compiled.querySelectorAll("button")).find(
      (node) => node.textContent?.includes("Suggérer un groupage")
    );
    expect(suggestButton).toBeTruthy();
    suggestButton?.click();
    fixture.detectChanges();

    const groupageReq = http.expectOne(
      (req) => req.url === "/api/v1/ia/groupage/propositions"
    );
    expect(groupageReq.request.body).toEqual({
      dossierIds: ["dossier-1", "dossier-2"],
    });
    groupageReq.flush([
      {
        confiance: null,
        dossierIds: ["dossier-1", "dossier-2"],
        gainKm: null,
        gainMarge: null,
        genereParIa: false,
        justification: "Regroupement de base.",
        score: null,
      },
    ]);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain("DOS-1 · DOS-2");
    const applyButton = Array.from(compiled.querySelectorAll("button")).find(
      (node) => node.textContent?.trim() === "Appliquer"
    );
    expect(applyButton).toBeTruthy();
    applyButton?.click();
    fixture.detectChanges();

    const checkboxes = compiled.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    expect(checkboxes.length).toBe(2);
    const page = fixture.componentInstance as unknown as {
      draft: () => { typeVoyage: string };
    };
    expect(page.draft().typeVoyage).toBe("GROUPAGE");
    http.verify();
  });

  it("calls IA itinéraire and fills distance and duration", async () => {
    const fixture = TestBed.createComponent(VoyageCreatePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne((req) => req.url === "/api/v1/vehicules").flush(EMPTY_PAGE);
    http
      .expectOne((req) => req.url === "/api/v1/dossiers")
      .flush({
        content: [
          {
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
                fenetre: {
                  debut: "2026-09-01T08:00:00Z",
                  fin: "2026-09-01T10:00:00Z",
                },
                ordre: 1,
                realiseLe: null,
                siteId: "site-depart",
                type: "CHARGEMENT",
              },
              {
                fenetre: {
                  debut: "2026-09-01T16:00:00Z",
                  fin: "2026-09-01T18:00:00Z",
                },
                ordre: 2,
                realiseLe: null,
                siteId: "site-arrivee",
                type: "DECHARGEMENT",
              },
            ],
            statut: "CREE",
            temperatureRequise: null,
            typeTransport: "NATIONAL",
            volumeM3: 10,
          },
        ],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 1,
        totalPages: 1,
      });
    http
      .expectOne((req) => req.url === "/api/v1/sites")
      .flush({
        content: [
          {
            actif: true,
            adresse: null,
            clientId: null,
            code: "SITE-PARIS",
            contraintesAcces: null,
            id: "site-depart",
            libelle: "Paris Nord",
            localisation: { latitude: 48.86, longitude: 2.35 },
          },
          {
            actif: true,
            adresse: null,
            clientId: null,
            code: "SITE-LYON",
            contraintesAcces: null,
            id: "site-arrivee",
            libelle: "Lyon Sud",
            localisation: { latitude: 45.75, longitude: 4.85 },
          },
        ],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 2,
        totalPages: 1,
      });
    http.expectOne((req) => req.url === "/api/v1/remorques").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/chauffeurs").flush(EMPTY_PAGE);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const checkbox = compiled.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();

    const button = Array.from(compiled.querySelectorAll("button")).find((node) =>
      node.textContent?.includes("Calculer via IA")
    );
    expect(button).toBeTruthy();
    button?.click();
    fixture.detectChanges();

    const calcReq = http.expectOne(
      (req) => req.url === "/api/v1/ia/itineraires/calcul"
    );
    expect(calcReq.request.body).toEqual({
      points: [
        {
          latitude: 48.86,
          libelle: "Chargement · SITE-PARIS — Paris Nord",
          longitude: 2.35,
        },
        {
          latitude: 45.75,
          libelle: "Déchargement · SITE-LYON — Lyon Sud",
          longitude: 4.85,
        },
      ],
    });
    calcReq.flush({
      distanceKm: 462.7,
      dureeMin: 285.4,
      geometrie: [],
      segments: [],
    });

    await fixture.whenStable();
    fixture.detectChanges();

    const distanceInput = compiled.querySelector(
      "#distanceTotaleKm"
    ) as HTMLInputElement;
    const dureeInput = compiled.querySelector(
      "#dureeConduiteMin"
    ) as HTMLInputElement;
    expect(distanceInput.value).toBe("463");
    expect(dureeInput.value).toBe("285");
    http.verify();
  });
});
