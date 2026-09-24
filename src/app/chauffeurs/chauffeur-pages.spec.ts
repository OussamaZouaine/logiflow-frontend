import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import type { Chauffeur } from "./chauffeur";
import { ChauffeurDetailPage } from "./chauffeur-detail-page";
import { ChauffeurFormPage } from "./chauffeur-form-page";
import { ChauffeursPage } from "./chauffeurs-page";

const CHAUFFEUR: Chauffeur = {
  adresse: null,
  categoriesPermis: ["C", "CE"],
  cin: "CIN1",
  dateDelivrancePasseport: null,
  dateDelivranceVisa: null,
  dateEmbauche: null,
  dateExpirationPasseport: null,
  dateExpirationPermis: "2030-01-01",
  dateExpirationVisa: null,
  dateNaissance: null,
  dateObtentionPermis: null,
  disponibilite: "DISPONIBLE",
  email: null,
  experienceAnnees: 8,
  habilitations: [
    {
      dateExpiration: "2031-01-01",
      dateObtention: "2024-01-01",
      reference: "ADR-1",
      type: "ADR_BASE",
    },
  ],
  id: "c1",
  lieuNaissance: null,
  matricule: "DRV-0001",
  nationalite: null,
  nom: "Martin",
  numeroPasseport: null,
  numeroPermis: "P-1",
  numeroVisa: null,
  paysDelivrancePasseport: null,
  paysVisa: null,
  prenom: "Jean",
  siteRattachementId: null,
  soldeTempsConduiteMinutes: 2257,
  specialisation: "ADR",
  statut: "ACTIF",
  telephone: "0600000000",
  typeContrat: "CDI",
  typeVisa: null,
};

const PAGE = (content: unknown[]) => ({
  content,
  pageNumber: 0,
  pageSize: 20,
  totalElements: content.length,
  totalPages: 1,
});

describe("Chauffeur pages", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("lists drivers with availability, permit and ADR badge", async () => {
    const fixture = TestBed.createComponent(ChauffeursPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);

    const req = http.expectOne((r) => r.url === "/api/v1/chauffeurs");
    expect(req.request.params.get("page")).toBe("0");
    req.flush(PAGE([CHAUFFEUR]));
    await fixture.whenStable();
    fixture.detectChanges();

    const texte = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(texte).toContain("Jean Martin");
    expect(texte).toContain("Disponible");
    expect(texte).toContain("C · CE");
    expect(texte).toContain("ADR");
    expect(texte).toContain("37 h 37");
    http.verify();
  });

  it("creates a driver with the nested profile payload", async () => {
    const fixture = TestBed.createComponent(ChauffeurFormPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url === "/api/v1/sites").flush(PAGE([]));
    const navigate = vi
      .spyOn(TestBed.inject(Router), "navigate")
      .mockResolvedValue(true);

    const page = fixture.componentInstance as unknown as {
      draft: { update: (fn: (d: Record<string, unknown>) => unknown) => void };
      onSubmit: (event: SubmitEvent) => Promise<void>;
    };
    page.draft.update((d) => ({
      ...d,
      matricule: "drv-9",
      nom: "Durand",
      prenom: "Luc",
      telephone: "0611",
    }));
    const envoi = page.onSubmit({
      preventDefault: vi.fn(),
    } as unknown as SubmitEvent);
    await fixture.whenStable();

    const req = http.expectOne(
      (r) => r.url === "/api/v1/chauffeurs" && r.method === "POST"
    );
    expect(req.request.body).toMatchObject({
      matricule: "DRV-9",
      nom: "Durand",
      prenom: "Luc",
      profil: { categoriesPermis: ["B", "C", "CE"], telephone: "0611" },
      soldeTempsConduiteInitialMinutes: 3360,
    });
    req.flush({ ...CHAUFFEUR, id: "c9" });
    await envoi;

    expect(navigate).toHaveBeenCalledWith(["/chauffeurs", "c9"]);
    http.verify();
  });

  it("shows habilitations with their validity and changes availability", async () => {
    const fixture = TestBed.createComponent(ChauffeurDetailPage);
    fixture.componentRef.setInput("id", "c1");
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne("/api/v1/chauffeurs/c1").flush(CHAUFFEUR);
    http.expectOne((r) => r.url === "/api/v1/voyages").flush(PAGE([]));
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 0);
    });
    fixture.detectChanges();
    for (const req of http.match((r) => r.url === "/api/v1/documents")) {
      req.flush([]);
    }
    await fixture.whenStable();
    fixture.detectChanges();

    const texte = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(texte).toContain("ADR (base)");
    expect(texte).toContain("Valide");
    expect(texte).toContain("Aucun voyage affecté.");

    const page = fixture.componentInstance as unknown as {
      changerDisponibilite: (valeur: string) => Promise<void>;
    };
    const changement = page.changerDisponibilite("EN_CONGE");
    const req = http.expectOne("/api/v1/chauffeurs/c1/disponibilite");
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ valeur: "EN_CONGE" });
    req.flush({ ...CHAUFFEUR, disponibilite: "EN_CONGE" });
    await changement;
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "En congé"
    );
  });
});
