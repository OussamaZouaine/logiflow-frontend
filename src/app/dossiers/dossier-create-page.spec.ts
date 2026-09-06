import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { DossierCreatePage } from "./dossier-create-page";

describe("DossierCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("loads commandes and sites for the form", async () => {
    const fixture = TestBed.createComponent(DossierCreatePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/commandes")
      .flush({
        content: [
          {
            clientId: "11111111-1111-1111-1111-111111111111",
            dateSouhaitee: "2026-09-10",
            id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
            prixNegocie: { devise: "EUR", montant: 1500 },
            reference: "CMD-2026-00001",
            statut: "CONFIRMEE",
          },
        ],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 1,
        totalPages: 1,
      });
    http
      .expectOne((req) => req.url === "/api/v1/sites")
      .flush({
        content: [
          {
            actif: true,
            code: "SITE-PARIS",
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            libelle: "Paris Nord",
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
    expect(compiled.textContent).toContain("CMD-2026-00001");
    expect(compiled.textContent).toContain("SITE-PARIS");
    http.verify();
  });

  it("shows French validation messages after an empty submit", async () => {
    const fixture = TestBed.createComponent(DossierCreatePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/commandes")
      .flush({
        content: [
          {
            clientId: "11111111-1111-1111-1111-111111111111",
            dateSouhaitee: "2026-09-10",
            id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
            prixNegocie: { devise: "EUR", montant: 1500 },
            reference: "CMD-2026-00001",
            statut: "CONFIRMEE",
          },
        ],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 1,
        totalPages: 1,
      });
    http
      .expectOne((req) => req.url === "/api/v1/sites")
      .flush({
        content: [
          {
            actif: true,
            code: "SITE-PARIS",
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            libelle: "Paris Nord",
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
    const form = compiled.querySelector("form");
    expect(form).not.toBeNull();
    form?.requestSubmit();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain(
      "Certains champs sont à corriger."
    );
    expect(compiled.textContent).toContain(
      "La commande confirmée est obligatoire."
    );
    expect(compiled.textContent).toContain(
      "Le site de chargement est obligatoire."
    );
    expect(compiled.textContent).toContain(
      "Le site de déchargement est obligatoire."
    );
    http.verify();
  });
});
