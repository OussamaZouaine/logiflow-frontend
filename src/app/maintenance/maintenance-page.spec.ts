import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { MaintenancePage } from "./maintenance-page";
import type { OrdreTravail } from "./ordre-travail";

const SAMPLE: OrdreTravail = {
  cout: { devise: "EUR", montant: 250 },
  datePlanifiee: "2026-09-04T16:00:00",
  dureeReelleMin: 0,
  id: "88888888-8888-8888-8888-888888888888",
  statut: "PLANIFIE",
  type: "ENTRETIEN_PREVENTIF",
  vehiculeId: "33333333-3333-3333-3333-333333333333",
};

describe("MaintenancePage", () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MaintenancePage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("explains the empty session list", () => {
    const fixture = TestBed.createComponent(MaintenancePage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Nouvel ordre");
    expect(compiled.textContent).toContain("Aucun ordre dans cette session");
  });

  it("renders remembered ordres from the session", () => {
    sessionStorage.setItem("logiflow.ordres-travail", JSON.stringify([SAMPLE]));
    const fixture = TestBed.createComponent(MaintenancePage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      "88888888-8888-8888-8888-888888888888"
    );
    expect(compiled.textContent).toContain("Planifié");
    expect(compiled.textContent).toContain("Entretien préventif");
  });
});
