import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { OrdreDetailPage } from "./ordre-detail-page";

describe("OrdreDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdreDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the ordre returned by the API", async () => {
    const fixture = TestBed.createComponent(OrdreDetailPage);
    fixture.componentRef.setInput("id", "88888888-8888-8888-8888-888888888888");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(
        (req) =>
          req.url ===
          "/api/v1/ordres-travail/88888888-8888-8888-8888-888888888888"
      )
      .flush({
        cout: { devise: "EUR", montant: 250 },
        datePlanifiee: "2026-09-04T16:00:00",
        dureeReelleMin: 0,
        id: "88888888-8888-8888-8888-888888888888",
        statut: "PLANIFIE",
        type: "ENTRETIEN_PREVENTIF",
        vehiculeId: "33333333-3333-3333-3333-333333333333",
      });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      "88888888-8888-8888-8888-888888888888"
    );
    expect(compiled.textContent).toContain("Planifié");
    expect(compiled.textContent).toContain("En cours");
    expect(compiled.textContent).toContain("Annulé");
    http.verify();
  });
});
