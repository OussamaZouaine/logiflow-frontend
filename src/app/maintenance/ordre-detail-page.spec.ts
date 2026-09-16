import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { OrdreDetailPage } from "./ordre-detail-page";

describe("OrdreDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdreDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the ordre with vehicule immatriculation and transitions", async () => {
    const fixture = TestBed.createComponent(OrdreDetailPage);
    fixture.componentRef.setInput("id", "88888888-8888-8888-8888-888888888888");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(
        (req) =>
          req.url ===
          "/api/v1/ordres-travail/88888888-8888-8888-8888-888888888888"
      )
      .flush({
        cout: { devise: "EUR", montant: 250 },
        datePlanifiee: "2026-09-04T16:00:00",
        dureeReelleMin: 0,
        id: "88888888-8888-8888-8888-888888888888",
        statut: "PLANIFIE",
        type: "ENTRETIEN_PREVENTIF",
        vehiculeId: "33333333-3333-3333-3333-333333333333",
      });

    http
      .expectOne((req) => req.url === "/api/v1/vehicules")
      .flush({
        content: [
          {
            id: "33333333-3333-3333-3333-333333333333",
            immatriculation: "AB-123-CD",
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
    expect(compiled.textContent).toContain("Entretien préventif");
    expect(compiled.textContent).toContain("AB-123-CD");
    expect(compiled.textContent).toContain("Planifié");
    expect(compiled.textContent).toContain("En cours");
    expect(compiled.textContent).toContain("Annulé");
    http.verify();
  });

  it("shows real duration when the ordre is terminé", async () => {
    const fixture = TestBed.createComponent(OrdreDetailPage);
    fixture.componentRef.setInput("id", "88888888-8888-8888-8888-888888888888");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(
        (req) =>
          req.url ===
          "/api/v1/ordres-travail/88888888-8888-8888-8888-888888888888"
      )
      .flush({
        cout: { devise: "EUR", montant: 250 },
        datePlanifiee: "2026-09-04T16:00:00",
        dureeReelleMin: 90,
        id: "88888888-8888-8888-8888-888888888888",
        statut: "TERMINE",
        type: "REPARATION",
        vehiculeId: "33333333-3333-3333-3333-333333333333",
      });

    http
      .expectOne((req) => req.url === "/api/v1/vehicules")
      .flush({
        content: [
          {
            id: "33333333-3333-3333-3333-333333333333",
            immatriculation: "AB-123-CD",
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
    expect(compiled.textContent).toContain("Durée réelle");
    expect(compiled.textContent).toContain("1 h 30 min");
    http.verify();
  });
});
