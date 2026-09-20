import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CommandeDetailPage } from "./commande-detail-page";

describe("CommandeDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the commande returned by the API", async () => {
    const fixture = TestBed.createComponent(CommandeDetailPage);
    fixture.componentRef.setInput("id", "77777777-7777-7777-7777-777777777777");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(
        (req) =>
          req.url === "/api/v1/commandes/77777777-7777-7777-7777-777777777777"
      )
      .flush({
        clientId: "11111111-1111-1111-1111-111111111111",
        dateSouhaitee: "2026-09-10",
        id: "77777777-7777-7777-7777-777777777777",
        lignes: [
          {
            marchandiseId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            nbColis: 12,
            poidsKg: 1200,
            volumeM3: 8,
          },
        ],
        prixNegocie: { devise: "EUR", montant: 2000 },
        reference: "CMD-2026-000001",
        statut: "RECUE",
      });

    http
      .expectOne((req) => req.url === "/api/v1/clients")
      .flush({
        content: [
          {
            actif: true,
            code: "CLI-ACME",
            id: "11111111-1111-1111-1111-111111111111",
            raisonSociale: "Acme Logistique",
          },
        ],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 1,
        totalPages: 1,
      });
    http
      .expectOne((req) => req.url === "/api/v1/marchandises")
      .flush({
        content: [
          {
            actif: true,
            classeAdr: null,
            code: "PAL-EUR",
            famille: "Palettes",
            gerbable: true,
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            libelle: "Palette EUR",
            numeroOnu: null,
          },
        ],
        pageNumber: 0,
        pageSize: 50,
        totalElements: 1,
        totalPages: 1,
      });
    http
      .expectOne(
        (req) =>
          req.url === "/api/v1/dossiers" &&
          req.params.get("commandeId") ===
            "77777777-7777-7777-7777-777777777777"
      )
      .flush({
        content: [],
        pageNumber: 0,
        pageSize: 1,
        totalElements: 0,
        totalPages: 0,
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("CMD-2026-000001");
    expect(compiled.textContent).toContain("CLI-ACME");
    expect(compiled.textContent).toContain("Palette EUR");
    expect(compiled.textContent).toContain("Confirmer");
    http.verify();
  });
});
