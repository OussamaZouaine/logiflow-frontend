import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { UtilisateursPage } from "./utilisateurs-page";

describe("UtilisateursPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateursPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders utilisateurs returned by the API", async () => {
    const fixture = TestBed.createComponent(UtilisateursPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/utilisateurs")
      .flush({
        content: [
          {
            actif: true,
            email: "jean.it@logiflow.tms",
            id: "99999999-9999-9999-9999-999999999999",
            login: "jean.it",
            roles: ["EXPLOITANT"],
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
    expect(compiled.textContent).toContain("jean.it");
    expect(compiled.textContent).toContain("Exploitant");
    http.verify();
  });

  it("shows an error when the backend is unreachable", async () => {
    const fixture = TestBed.createComponent(UtilisateursPage);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((req) => req.url === "/api/v1/utilisateurs")
      .error(new ProgressEvent("error"));

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Backend injoignable");
    http.verify();
  });
});
