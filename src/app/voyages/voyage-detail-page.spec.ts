import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { VoyageDetailPage } from "./voyage-detail-page";

describe("VoyageDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoyageDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the voyage returned by the API", async () => {
    const fixture = TestBed.createComponent(VoyageDetailPage);
    fixture.componentRef.setInput("id", "55555555-5555-5555-5555-555555555555");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne(
        (req) =>
          req.url === "/api/v1/voyages/55555555-5555-5555-5555-555555555555"
      )
      .flush({
        affectations: [
          {
            chauffeurId: "66666666-6666-6666-6666-666666666666",
            dateAffectation: "2026-09-01T10:00:00Z",
            role: "TITULAIRE",
          },
        ],
        arriveePrevue: "2026-09-02T16:00:00Z",
        departPrevu: "2026-09-02T08:00:00Z",
        dossierIds: ["44444444-4444-4444-4444-444444444444"],
        id: "55555555-5555-5555-5555-555555555555",
        portee: "NATIONAL",
        reference: "VOY-2026-00001",
        remorqueId: null,
        statut: "BROUILLON",
        tauxRemplissage: 0,
        trajet: {
          distanceTotaleKm: 450,
          dureeConduiteMin: 360,
          dureeTotaleMin: 420,
          etapes: [
            {
              chargeApresKg: 500,
              distanceDepuisPrecedenteKm: 0,
              eta: "2026-09-02T08:00:00Z",
              etd: "2026-09-02T08:00:00Z",
              ordre: 0,
              type: "CHARGEMENT",
            },
            {
              chargeApresKg: 0,
              distanceDepuisPrecedenteKm: 450,
              eta: "2026-09-02T16:00:00Z",
              etd: null,
              ordre: 1,
              type: "DECHARGEMENT",
            },
          ],
        },
        typeVoyage: "SIMPLE",
        vehiculeId: "33333333-3333-3333-3333-333333333333",
      });
    http
      .expectOne(
        (req) =>
          req.url ===
          "/api/v1/voyages/55555555-5555-5555-5555-555555555555/evenements"
      )
      .flush([]);

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("VOY-2026-00001");
    expect(compiled.textContent).toContain("Planifié");
    expect(compiled.textContent).toContain("Déclarer");
    http.verify();
  });
});
