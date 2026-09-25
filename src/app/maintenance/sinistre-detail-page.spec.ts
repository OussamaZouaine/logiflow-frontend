import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { Sinistre } from "./maintenance";
import { SinistreDetailPage } from "./sinistre-detail-page";

const COUT_NET_ATTENDU = /1\s300,00\s€/;

const ID = "55555555-5555-5555-5555-555555555555";
const VEHICULE = "33333333-3333-3333-3333-333333333333";

function sinistre(statut: Sinistre["statut"]): Sinistre {
  return {
    blesses: false,
    chauffeurId: null,
    constatAmiable: true,
    contratId: null,
    couts: {
      coutNet: 1300,
      franchise: 500,
      indemnite: 1500,
      ordresOuverts: 0,
      ordresTravail: 1,
      reparationsHt: 2800,
      reparationsTtc: 3360,
    },
    dateCloture: null,
    dateDeclarationAssureur: null,
    dateExpertise: null,
    dateSurvenance: "2026-09-20T08:30:00",
    declarationEnRetard: true,
    description: "Accrochage sur un quai de déchargement.",
    enginImmobilise: false,
    estimationDommages: 3000,
    expertId: null,
    franchise: 500,
    gravite: "MATERIEL_LEGER",
    id: ID,
    indemnite: 1500,
    latitude: null,
    lieu: "Lyon",
    longitude: null,
    numeroDossierAssureur: null,
    rapportPolice: false,
    reference: "SIN-2026-000001",
    remorqueId: null,
    responsabilite: "PARTAGEE",
    statut,
    tiers: null,
    type: "ACCROCHAGE",
    vehiculeId: VEHICULE,
    voyageId: null,
  };
}

function tick(): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, 0);
  });
}

function page<T>(content: T[]) {
  return {
    content,
    number: 0,
    size: 100,
    totalElements: content.length,
    totalPages: 1,
  };
}

describe("SinistreDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinistreDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  function flushLookups(http: HttpTestingController): void {
    http
      .expectOne((r) => r.url === "/api/v1/vehicules")
      .flush(page([{ id: VEHICULE, immatriculation: "AB-123-CD" }]));
    http.expectOne((r) => r.url === "/api/v1/remorques").flush(page([]));
    http
      .expectOne((r) => r.url === "/api/v1/maintenance/prestataires")
      .flush(page([]));
  }

  it("affiche le coût net, l'alerte de déclaration et l'OT de réparation à créer", async () => {
    const fixture = TestBed.createComponent(SinistreDetailPage);
    fixture.componentRef.setInput("id", ID);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);

    flushLookups(http);
    http
      .expectOne(`/api/v1/maintenance/sinistres/${ID}`)
      .flush(sinistre("DECLARE"));
    http
      .expectOne(`/api/v1/maintenance/sinistres/${ID}/ordres-travail`)
      .flush([]);
    await tick();
    fixture.detectChanges();
    for (const req of http.match((r) => r.url === "/api/v1/documents")) {
      req.flush([]);
    }
    await tick();
    fixture.detectChanges();

    const texte = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(texte).toContain("SIN-2026-000001");
    expect(texte).toContain("Déclaration assureur en retard");
    expect(texte).toMatch(COUT_NET_ATTENDU);
    expect(texte).toContain("Créer l'OT de réparation — AB-123-CD");
    expect(texte).toContain("Déclaré à l'assureur");
  });

  it("fait avancer le workflow assurance", async () => {
    const fixture = TestBed.createComponent(SinistreDetailPage);
    fixture.componentRef.setInput("id", ID);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);

    flushLookups(http);
    http
      .expectOne(`/api/v1/maintenance/sinistres/${ID}`)
      .flush(sinistre("DECLARE"));
    http
      .expectOne(`/api/v1/maintenance/sinistres/${ID}/ordres-travail`)
      .flush([]);
    await tick();
    fixture.detectChanges();
    for (const req of http.match((r) => r.url === "/api/v1/documents")) {
      req.flush([]);
    }
    await tick();
    fixture.detectChanges();

    const bouton = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll("button"),
    ].find((b) => b.textContent?.trim() === "Déclaré à l'assureur");
    expect(bouton).toBeDefined();
    bouton?.click();
    const patch = http.expectOne(`/api/v1/maintenance/sinistres/${ID}/statut`);
    expect(patch.request.method).toBe("PATCH");
    expect(patch.request.body).toEqual({ valeur: "DECLARE_ASSUREUR" });
    patch.flush(sinistre("DECLARE_ASSUREUR"));
    await tick();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "Expertise en cours"
    );
  });
});
