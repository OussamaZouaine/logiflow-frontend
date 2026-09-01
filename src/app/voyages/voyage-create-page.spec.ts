import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { VoyageCreatePage } from "./voyage-create-page";

const EMPTY_PAGE = {
  content: [],
  pageNumber: 0,
  pageSize: 50,
  totalElements: 0,
  totalPages: 0,
};

describe("VoyageCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoyageCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the create form after lookups load", async () => {
    const fixture = TestBed.createComponent(VoyageCreatePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne((req) => req.url === "/api/v1/vehicules").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/dossiers").flush(EMPTY_PAGE);
    http.expectOne((req) => req.url === "/api/v1/chauffeurs").flush(EMPTY_PAGE);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Nouveau voyage");
    expect(compiled.querySelector("#vehiculeId")).toBeTruthy();
    http.verify();
  });
});
