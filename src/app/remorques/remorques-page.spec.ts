import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { RemorquesPage } from "./remorques-page";

describe("RemorquesPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemorquesPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders remorques returned by the API", async () => {
    const fixture = TestBed.createComponent(RemorquesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/remorques")
      .flush({
        content: [
          {
            anneeFabrication: null,
            carrosserie: "TAUTLINER",
            chargeUtileKg: 24_000,
            groupeFroid: false,
            heuresGroupeFroid: 0,
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            immatriculation: "AB-123-CD",
            kilometrage: 12_000,
            marque: null,
            modele: null,
            nbPositionsPalettes: 33,
            numeroParc: null,
            statut: "DISPONIBLE",
            type: null,
            vin: null,
            volumeUtileM3: 80,
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
    expect(compiled.textContent).toContain("AB-123-CD");
    http.verify();
  });
});
