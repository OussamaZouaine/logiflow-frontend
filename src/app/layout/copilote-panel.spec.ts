import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CopiloteStore } from "../ia/copilote-store";
import { CopilotePanel } from "./copilote-panel";

describe("CopilotePanel", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotePanel],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  function ouvrir() {
    const fixture = TestBed.createComponent(CopilotePanel);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector("button")?.click();
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne("/api/v1/ia/copilote/conversations").flush([
      {
        creeLe: "2026-09-23T10:00:00Z",
        id: "c1",
        modifieLe: "2026-09-23T10:00:00Z",
        titre: "Consommation carburant",
      },
    ]);
    fixture.detectChanges();
    return { compiled, fixture, http };
  }

  it("opens the side panel with suggestions", () => {
    const { compiled, http } = ouvrir();

    expect(compiled.querySelector('[role="dialog"]')).not.toBeNull();
    expect(compiled.textContent).toContain("Quels voyages sont en cours ?");
    http.verify();
  });

  it("lists past conversations in the history view", async () => {
    const { compiled, fixture, http } = ouvrir();
    await fixture.whenStable();

    (
      compiled.querySelector(
        'button[aria-label="Historique des conversations"]'
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain("Consommation carburant");
    http.verify();
  });

  it("renders assistant markdown safely with source links", () => {
    const { compiled, fixture } = ouvrir();
    const store = TestBed.inject(CopiloteStore);
    store.messages.set([
      {
        contenu: "**VOY-1** <script>alert(1)</script>",
        erreur: null,
        id: "m1",
        note: null,
        outils: [
          {
            libelle: "Recherche des voyages",
            nom: "rechercher_voyages",
            statut: "fin",
          },
        ],
        role: "assistant",
        sources: [{ id: "v1", reference: "VOY-1", type: "VOYAGE" }],
        statut: "complet",
      },
    ]);
    fixture.detectChanges();

    const markdown = compiled.querySelector(".copilote-markdown");
    expect(markdown?.querySelector("strong")?.textContent).toBe("VOY-1");
    expect(markdown?.querySelector("script")).toBeNull();
    expect(compiled.textContent).toContain("Recherche des voyages");
    const lien = compiled.querySelector("a.copilote-source");
    expect(lien?.getAttribute("href")).toBe("/voyages/v1");
    expect(
      compiled.querySelector('button[aria-label="Réponse utile"]')
    ).not.toBeNull();
  });

  it("closes on Escape", () => {
    const { compiled, fixture } = ouvrir();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();

    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
  });
});
