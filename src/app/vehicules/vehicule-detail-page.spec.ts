import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { VehiculeDetailPage } from "./vehicule-detail-page";

describe("VehiculeDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the vehicule returned by the API", async () => {
    const fixture = TestBed.createComponent(VehiculeDetailPage);
    fixture.componentRef.setInput("id", "33333333-3333-3333-3333-333333333333");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(
        (req) =>
          req.url === "/api/v1/vehicules/33333333-3333-3333-3333-333333333333"
      )
      .flush({
        chargeUtileKg: 9000,
        documents: [],
        heuresMoteur: 12,
        id: "33333333-3333-3333-3333-333333333333",
        immatriculation: "AB-123-CD",
        kilometrage: 40_000,
        ptacKg: 19_000,
        statut: "DISPONIBLE",
        type: "TRACTEUR",
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("AB-123-CD");
    expect(compiled.textContent).toContain("Compteurs");
    http.verify();
  });
});
