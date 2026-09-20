import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { ClientsPage } from "./clients-page";

describe("ClientsPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders clients returned by the API", async () => {
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/clients")
      .flush({
        content: [
          {
            actif: true,
            code: "CLI-ACME",
            id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            raisonSociale: "Acme Logistique",
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
    expect(compiled.textContent).toContain("CLI-ACME");
    expect(compiled.textContent).toContain("Acme Logistique");
    http.verify();
  });
});
