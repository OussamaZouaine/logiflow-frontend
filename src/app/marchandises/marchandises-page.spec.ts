import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { MarchandisesPage } from "./marchandises-page";

describe("MarchandisesPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarchandisesPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders marchandises returned by the API", async () => {
    const fixture = TestBed.createComponent(MarchandisesPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
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
        pageSize: 20,
        totalElements: 1,
        totalPages: 1,
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("PAL-EUR");
    expect(compiled.textContent).toContain("Palette EUR");
    http.verify();
  });
});
