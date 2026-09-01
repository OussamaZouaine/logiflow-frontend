import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { UtilisateurDetailPage } from "./utilisateur-detail-page";

describe("UtilisateurDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the utilisateur returned by the API", async () => {
    const fixture = TestBed.createComponent(UtilisateurDetailPage);
    fixture.componentRef.setInput("id", "99999999-9999-9999-9999-999999999999");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(
        (req) =>
          req.url ===
          "/api/v1/utilisateurs/99999999-9999-9999-9999-999999999999"
      )
      .flush({
        actif: true,
        email: "jean.it@logiflow.tms",
        id: "99999999-9999-9999-9999-999999999999",
        login: "jean.it",
        roles: ["EXPLOITANT"],
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("jean.it");
    expect(compiled.textContent).toContain("Désactiver");
    http.verify();
  });
});
