import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CommandesPage } from "./commandes-page";

describe("CommandesPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandesPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders commandes returned by the API", async () => {
    const fixture = TestBed.createComponent(CommandesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/commandes")
      .flush({
        content: [
          {
            clientId: "11111111-1111-1111-1111-111111111111",
            dateSouhaitee: "2026-09-10",
            id: "77777777-7777-7777-7777-777777777777",
            prixNegocie: { devise: "EUR", montant: 2000 },
            reference: "CMD-2026-000001",
            statut: "RECUE",
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
    expect(compiled.textContent).toContain("CMD-2026-000001");
    expect(compiled.textContent).toContain("Reçue");
    http.verify();
  });

  it("shows an error when the backend is unreachable", async () => {
    const fixture = TestBed.createComponent(CommandesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/commandes")
      .error(new ProgressEvent("error"));

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Backend injoignable");
    http.verify();
  });
});
