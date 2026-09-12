import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CommandeCreatePage } from "./commande-create-page";

describe("CommandeCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the create form", () => {
    const fixture = TestBed.createComponent(CommandeCreatePage);
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
        pageSize: 50,
        totalElements: 1,
        totalPages: 1,
      });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Nouvelle commande");
    expect(compiled.textContent).toContain("Lignes de marchandise");
    expect(compiled.querySelector("#clientCode")).toBeTruthy();
    expect(compiled.querySelector("#dateSouhaitee")).toBeTruthy();
    http.verify();
  });
});
