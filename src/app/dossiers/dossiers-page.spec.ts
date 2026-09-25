import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AUTH_DEMO_TEST_PROVIDERS } from "../core/auth/auth-test-providers";
import { DossiersPage } from "./dossiers-page";

describe("DossiersPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossiersPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ...AUTH_DEMO_TEST_PROVIDERS,
      ],
    }).compileComponents();
  });

  it("renders dossiers returned by the API", async () => {
    const fixture = TestBed.createComponent(DossiersPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne((req) => req.url === "/api/v1/dossiers");
    request.flush({
      content: [
        {
          carrosserieRequise: null,
          commandeId: "11111111-1111-1111-1111-111111111111",
          contientAdr: false,
          documents: [],
          familleMarchandise: "Palettes standard",
          groupable: true,
          id: "22222222-2222-2222-2222-222222222222",
          lignesMarchandise: [],
          nbPalettes: 10,
          poidsBrutKg: 500,
          reference: "DT-2026-00001",
          segments: [],
          statut: "CREE",
          temperatureRequise: null,
          typeTransport: "NATIONAL",
          volumeM3: 2.5,
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
    expect(compiled.textContent).toContain("DT-2026-00001");
    expect(compiled.textContent).toContain("Palettes standard");
    http.verify();
  });
});
