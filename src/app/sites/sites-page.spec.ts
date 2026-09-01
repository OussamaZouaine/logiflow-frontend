import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { SitesPage } from "./sites-page";

describe("SitesPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SitesPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it("renders sites returned by the API", async () => {
    const fixture = TestBed.createComponent(SitesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne((req) => req.url === "/api/v1/sites");
    request.flush({
      content: [
        {
          actif: true,
          adresse: "10 rue de la Logistique, 75018 Paris",
          clientId: "11111111-1111-1111-1111-111111111111",
          code: "SITE-DEMO-PARIS",
          id: "22222222-2222-2222-2222-222222222222",
          libelle: "Entrepôt Paris Nord",
          localisation: { latitude: 48.8566, longitude: 2.3522 },
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
    expect(compiled.textContent).toContain("Entrepôt Paris Nord");
    expect(compiled.textContent).toContain("SITE-DEMO-PARIS");
    http.verify();
  });

  it("shows an error when the backend is unreachable", async () => {
    const fixture = TestBed.createComponent(SitesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/sites")
      .error(new ProgressEvent("error"));

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Backend injoignable");
    http.verify();
  });
});
