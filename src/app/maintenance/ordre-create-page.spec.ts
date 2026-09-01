import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { OrdreCreatePage } from "./ordre-create-page";

const EMPTY_PAGE = {
  content: [],
  pageNumber: 0,
  pageSize: 50,
  totalElements: 0,
  totalPages: 0,
};

describe("OrdreCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdreCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the create form after vehicles load", async () => {
    const fixture = TestBed.createComponent(OrdreCreatePage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne((req) => req.url === "/api/v1/vehicules").flush(EMPTY_PAGE);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Nouvel ordre de travail");
    expect(compiled.querySelector("#vehiculeId")).toBeTruthy();
    expect(compiled.querySelector("#datePlanifiee")).toBeTruthy();
    http.verify();
  });
});
