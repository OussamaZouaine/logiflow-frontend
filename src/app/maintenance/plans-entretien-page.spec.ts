import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { PlansEntretienPage } from "./plans-entretien-page";

describe("PlansEntretienPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansEntretienPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders plans returned by the API", async () => {
    const fixture = TestBed.createComponent(PlansEntretienPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/plans-entretien")
      .flush({
        content: [
          {
            dureeEstimeeMin: 60,
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            libelle: "Vidange moteur",
            periodiciteKm: 30_000,
            periodiciteMois: 12,
            seuilAlerteKm: 500,
            vehiculeId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          },
        ],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 1,
        totalPages: 1,
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
    expect(compiled.textContent).toContain("Vidange moteur");
    http.verify();
  });
});
