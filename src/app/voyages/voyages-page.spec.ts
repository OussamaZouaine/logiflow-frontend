import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { VoyagesPage } from "./voyages-page";

describe("VoyagesPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoyagesPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders voyages returned by the API", async () => {
    const fixture = TestBed.createComponent(VoyagesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/voyages")
      .flush({
        content: [
          {
            affectations: [],
            arriveePrevue: "2026-09-02T16:00:00Z",
            departPrevu: "2026-09-02T08:00:00Z",
            dossierIds: ["44444444-4444-4444-4444-444444444444"],
            id: "55555555-5555-5555-5555-555555555555",
            portee: "NATIONAL",
            reference: "VOY-2026-00001",
            remorqueId: null,
            statut: "BROUILLON",
            tauxRemplissage: 0,
            trajet: {
              distanceTotaleKm: 450,
              dureeConduiteMin: 360,
              dureeTotaleMin: 420,
              etapes: [],
            },
            typeVoyage: "SIMPLE",
            vehiculeId: "33333333-3333-3333-3333-333333333333",
          },
        ],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 1,
        totalPages: 1,
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("VOY-2026-00001");
    expect(compiled.textContent).toContain("Brouillon");
    http.verify();
  });

  it("shows an error when the backend is unreachable", async () => {
    const fixture = TestBed.createComponent(VoyagesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/voyages")
      .error(new ProgressEvent("error"));

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Backend injoignable");
    http.verify();
  });
});
