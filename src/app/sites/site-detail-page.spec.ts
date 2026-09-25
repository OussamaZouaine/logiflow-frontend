import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { SiteDetailPage } from "./site-detail-page";

describe("SiteDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the site returned by the API", async () => {
    const fixture = TestBed.createComponent(SiteDetailPage);
    fixture.componentRef.setInput("id", "22222222-2222-2222-2222-222222222222");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(
        (req) =>
          req.url === "/api/v1/sites/22222222-2222-2222-2222-222222222222"
      )
      .flush({
        actif: true,
        adresse: "Zone industrielle Ain Sebaa, Casablanca 20250",
        clientId: null,
        code: "SITE-DEMO-CASA",
        contraintesAcces: {
          hauteurMaxMetres: null,
          instructions: null,
          interditPoidsLourd: false,
          poidsMaxTonnes: null,
        },
        id: "22222222-2222-2222-2222-222222222222",
        libelle: "Hub Casablanca Ain Sebaa",
        localisation: { latitude: 33.5731, longitude: -7.5898 },
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("SITE-DEMO-CASA");
    expect(compiled.textContent).toContain("Désactiver");
    http.verify();
  });
});
