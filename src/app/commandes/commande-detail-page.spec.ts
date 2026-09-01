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
        prixNegocie: { devise: "EUR", montant: 2000 },
        reference: "CMD-2026-000001",
        statut: "RECUE",
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("CMD-2026-000001");
    expect(compiled.textContent).toContain("Confirmer");
    http.verify();
  });
});
