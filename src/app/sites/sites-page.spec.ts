import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { SitesPage } from "./sites-page";

describe("SitesPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SitesPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
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

  it("shows pagination controls when the API reports multiple pages", async () => {
    const fixture = TestBed.createComponent(SitesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne((req) => req.url === "/api/v1/sites").flush({
      content: [
        {
          actif: true,
          adresse: null,
          clientId: null,
          code: "SITE-A",
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          libelle: "Site A",
          localisation: { latitude: 48.8, longitude: 2.3 },
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 25,
      totalPages: 2,
    });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Page 1 / 2");
    expect(compiled.textContent).toContain("Précédent");
    expect(compiled.textContent).toContain("Suivant");

    const next = compiled.querySelector(
      'nav[aria-label="Pagination"] button:last-of-type'
    ) as HTMLButtonElement | null;
    expect(next?.disabled).toBe(false);
    next?.click();
    fixture.detectChanges();

    const page2 = http.expectOne(
      (req) =>
        req.url === "/api/v1/sites" && req.params.get("page") === "1"
    );
    page2.flush({
      content: [
        {
          actif: true,
          adresse: null,
          clientId: null,
          code: "SITE-B",
          id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          libelle: "Site B",
          localisation: { latitude: 45.7, longitude: 4.8 },
        },
      ],
      pageNumber: 1,
      pageSize: 20,
      totalElements: 25,
      totalPages: 2,
    });

    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain("Page 2 / 2");
    expect(compiled.textContent).toContain("Site B");
    http.verify();
  });
});
