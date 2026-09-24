import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { PageResponse } from "../core/api/page-response";
import { DEMO_PASSWORD } from "../core/auth/demo-identity";
import { DemoSessionService } from "../core/auth/demo-session";
import { TableauDeBordPage } from "./tableau-de-bord-page";

function pageOf<T>(
  content: T[],
  totalElements = content.length
): PageResponse<T> {
  return {
    content,
    pageNumber: 0,
    pageSize: 100,
    totalElements,
    totalPages: totalElements === 0 ? 0 : 1,
  };
}

function flushUrl(
  http: HttpTestingController,
  url: string,
  body: PageResponse<unknown>
): void {
  for (const req of http.match((request) => request.url === url)) {
    req.flush(body);
  }
}

describe("TableauDeBordPage", () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TableauDeBordPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders Aperçu before File du jour in document order", async () => {
    TestBed.inject(DemoSessionService).signIn("admin", DEMO_PASSWORD);
    const fixture = TestBed.createComponent(TableauDeBordPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    flushUrl(http, "/api/v1/sites", pageOf([]));
    flushUrl(http, "/api/v1/vehicules", pageOf([]));
    flushUrl(http, "/api/v1/commandes", pageOf([]));
    flushUrl(http, "/api/v1/dossiers", pageOf([]));
    flushUrl(http, "/api/v1/voyages", pageOf([]));
    flushUrl(http, "/api/v1/ordres-travail", pageOf([]));
    flushUrl(http, "/api/v1/utilisateurs", pageOf([]));
    flushUrl(http, "/api/v1/prises-carburant", pageOf([]));

    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const apercu = root.querySelector('[aria-label="Aperçu"]');
    const fileDuJour = root.querySelector("#file-du-jour");
    expect(apercu).not.toBeNull();
    expect(fileDuJour).not.toBeNull();
    expect(
      apercu?.compareDocumentPosition(fileDuJour!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    http.verify();
  });

  it("shows Sites for an exploitant and omits Maintenance", async () => {
    TestBed.inject(DemoSessionService).signIn("exploitant", DEMO_PASSWORD);
    const fixture = TestBed.createComponent(TableauDeBordPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    flushUrl(http, "/api/v1/sites", pageOf([]));
    flushUrl(http, "/api/v1/vehicules", pageOf([]));
    flushUrl(http, "/api/v1/commandes", pageOf([]));
    flushUrl(http, "/api/v1/dossiers", pageOf([]));
    flushUrl(http, "/api/v1/voyages", pageOf([]));
    flushUrl(http, "/api/v1/prises-carburant", pageOf([]));

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const apercu = compiled.querySelector('[aria-label="Aperçu"]');
    expect(apercu?.textContent).toContain("Sites");
    expect(apercu?.textContent).not.toContain("Maintenance");
    expect(compiled.textContent).not.toContain("Ouvert");
    expect(compiled.textContent).not.toContain("Maintenance");
    http.verify();
  });

  it("hides Sites for a chauffeur and offers Voyages", async () => {
    TestBed.inject(DemoSessionService).signIn("chauffeur", DEMO_PASSWORD);
    const fixture = TestBed.createComponent(TableauDeBordPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    flushUrl(http, "/api/v1/voyages", pageOf([]));
    flushUrl(http, "/api/v1/prises-carburant", pageOf([]));

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Voyages");
    expect(compiled.textContent).not.toContain("Sites");
    http.verify();
  });

  it("shows Maintenance in the Aperçu for admin", async () => {
    TestBed.inject(DemoSessionService).signIn("admin", DEMO_PASSWORD);
    const fixture = TestBed.createComponent(TableauDeBordPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    flushUrl(http, "/api/v1/sites", pageOf([]));
    flushUrl(http, "/api/v1/vehicules", pageOf([]));
    flushUrl(http, "/api/v1/commandes", pageOf([]));
    flushUrl(http, "/api/v1/dossiers", pageOf([]));
    flushUrl(http, "/api/v1/voyages", pageOf([]));
    flushUrl(http, "/api/v1/ordres-travail", pageOf([], 2));
    flushUrl(http, "/api/v1/utilisateurs", pageOf([]));
    flushUrl(http, "/api/v1/prises-carburant", pageOf([]));

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const apercu = compiled.querySelector('[aria-label="Aperçu"]');
    expect(apercu?.textContent).toContain("Maintenance");
    expect(apercu?.textContent).toContain("2");
    expect(
      compiled.querySelector('[aria-label="Modules de ce rôle"]')
    ).toBeNull();
    http.verify();
  });

  it("shows a statut breakdown only when the collection is complete", async () => {
    TestBed.inject(DemoSessionService).signIn("atelier", DEMO_PASSWORD);
    const fixture = TestBed.createComponent(TableauDeBordPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    flushUrl(http, "/api/v1/ordres-travail", pageOf([]));
    flushUrl(
      http,
      "/api/v1/vehicules",
      pageOf(
        [
          {
            chargeUtileKg: 9000,
            heuresMoteur: 12,
            id: "33333333-3333-3333-3333-333333333333",
            immatriculation: "AB-123-CD",
            kilometrage: 40_000,
            ptacKg: 19_000,
            statut: "DISPONIBLE",
            type: "TRACTEUR",
          },
          {
            chargeUtileKg: 8000,
            heuresMoteur: 8,
            id: "44444444-4444-4444-4444-444444444444",
            immatriculation: "EF-456-GH",
            kilometrage: 10_000,
            ptacKg: 18_000,
            statut: "EN_VOYAGE",
            type: "PORTEUR",
          },
        ],
        2
      )
    );

    await fixture.whenStable();
    fixture.detectChanges();

    const apercu = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Aperçu"]'
    );
    expect(apercu?.textContent).toContain("2");
    expect(apercu?.textContent).toContain("Disponible");
    expect(apercu?.textContent).toContain("En voyage");
    http.verify();
  });

  it("hides the statut breakdown when the page is incomplete", async () => {
    TestBed.inject(DemoSessionService).signIn("atelier", DEMO_PASSWORD);
    const fixture = TestBed.createComponent(TableauDeBordPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    flushUrl(http, "/api/v1/ordres-travail", pageOf([]));
    flushUrl(
      http,
      "/api/v1/vehicules",
      pageOf(
        [
          {
            chargeUtileKg: 9000,
            heuresMoteur: 12,
            id: "33333333-3333-3333-3333-333333333333",
            immatriculation: "AB-123-CD",
            kilometrage: 40_000,
            ptacKg: 19_000,
            statut: "DISPONIBLE",
            type: "TRACTEUR",
          },
        ],
        3
      )
    );

    await fixture.whenStable();
    fixture.detectChanges();

    const apercu = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Aperçu"]'
    );
    expect(apercu?.textContent).toContain("3");
    expect(apercu?.textContent).not.toContain("Disponible");
    http.verify();
  });
});
