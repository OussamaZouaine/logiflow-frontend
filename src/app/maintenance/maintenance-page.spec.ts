import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { MaintenancePage } from "./maintenance-page";

const SAMPLE = {
  cout: { devise: "EUR", montant: 250 },
  datePlanifiee: "2026-09-04T16:00:00",
  dureeReelleMin: 0,
  id: "88888888-8888-8888-8888-888888888888",
  statut: "PLANIFIE",
  type: "ENTRETIEN_PREVENTIF",
  vehiculeId: "33333333-3333-3333-3333-333333333333",
};

describe("MaintenancePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenancePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders ordres returned by the API", async () => {
    const fixture = TestBed.createComponent(MaintenancePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/ordres-travail")
      .flush({
        content: [SAMPLE],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 1,
        totalPages: 1,
      });
    http
      .expectOne((req) => req.url === "/api/v1/vehicules")
      .flush({
        content: [
          {
            id: "33333333-3333-3333-3333-333333333333",
            immatriculation: "GP-001-AF",
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
    expect(compiled.textContent).toContain("#888888888888");
    expect(compiled.textContent).toContain("GP-001-AF");
    expect(compiled.textContent).toContain("Planifié");
    expect(compiled.textContent).toContain("Entretien préventif");
    http.verify();
  });

  it("shows an empty state when the collection is empty", async () => {
    const fixture = TestBed.createComponent(MaintenancePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/ordres-travail")
      .flush({
        content: [],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
      });
    http
      .expectOne((req) => req.url === "/api/v1/vehicules")
      .flush({
        content: [],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 0,
        totalPages: 0,
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Aucun ordre en base");
    expect(compiled.textContent).toContain("Nouvel ordre");
    http.verify();
  });

  it("shows an error when the backend is unreachable", async () => {
    const fixture = TestBed.createComponent(MaintenancePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/ordres-travail")
      .error(new ProgressEvent("error"));
    http
      .expectOne((req) => req.url === "/api/v1/vehicules")
      .flush({
        content: [],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 0,
        totalPages: 0,
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Backend injoignable");
    http.verify();
  });
});
