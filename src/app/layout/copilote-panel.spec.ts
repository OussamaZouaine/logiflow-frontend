import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { AUTH_DEMO_TEST_PROVIDERS } from "../core/auth/auth-test-providers";
import type { EtatCopilote } from "../ia/copilote";
import { CopiloteStore, type MessageVue } from "../ia/copilote-store";
import { CopiloteBouton } from "./copilote-bouton";
import { CopilotePanel } from "./copilote-panel";

const ETAT_OK: EtatCopilote = {
  base: "UP",
  fournisseur: "api.groq.com",
  llm: "UP",
  modele: "llama-3.3-70b-versatile",
  operationnel: true,
  serviceIa: true,
};

function message(partiel: Partial<MessageVue>): MessageVue {
  return {
    contenu: "",
    creeLe: "2026-09-23T10:00:00Z",
    erreur: null,
    id: "x",
    note: null,
    outils: [],
    role: "assistant",
    sources: [],
    statut: "complet",
    ...partiel,
  };
}

describe("CopilotePanel", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotePanel, CopiloteBouton],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ...AUTH_DEMO_TEST_PROVIDERS,
      ],
    }).compileComponents();
  });

  async function ouvrir(etat: EtatCopilote = ETAT_OK) {
    const bouton = TestBed.createComponent(CopiloteBouton);
    const fixture = TestBed.createComponent(CopilotePanel);
    bouton.detectChanges();
    fixture.detectChanges();
    (bouton.nativeElement as HTMLElement).querySelector("button")?.click();
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
    http.expectOne("/api/v1/ia/copilote/etat").flush(etat);
    await fixture.whenStable();
    fixture.detectChanges();
    return { compiled: fixture.nativeElement as HTMLElement, fixture, http };
  }

  it("opens as a right-side panel with history, suggestions and service status", async () => {
    const { compiled, http } = await ouvrir();

    expect(compiled.querySelector("aside.copilote-panneau")).not.toBeNull();
    expect(
      compiled.querySelector(".copilote-historique")?.textContent
    ).toContain("Consommation carburant");
    expect(compiled.textContent).toContain("Quels voyages sont en cours ?");
    expect(compiled.querySelector(".copilote-etat--ok")?.textContent).toContain(
      "En ligne"
    );
    expect(compiled.querySelector(".copilote-bandeau")).toBeNull();
    http.verify();
  });

  it("warns when the LLM API key is rejected", async () => {
    const { compiled } = await ouvrir({
      ...ETAT_OK,
      llm: "CLE_INVALIDE",
      operationnel: false,
    });

    expect(
      compiled.querySelector(".copilote-etat--hors_ligne")?.textContent
    ).toContain("Clé API invalide");
    expect(compiled.querySelector(".copilote-bandeau")?.textContent).toContain(
      "LLM_API_KEY"
    );
  });

  it("shows send status on user messages and renders answers safely", async () => {
    const { compiled, fixture } = await ouvrir();
    TestBed.inject(CopiloteStore).messages.set([
      message({ contenu: "Question 1", id: "u1", role: "user" }),
      message({
        contenu: "**VOY-1** <script>alert(1)</script>",
        id: "m1",
        outils: [
          {
            libelle: "Recherche des voyages",
            nom: "rechercher_voyages",
            statut: "fin",
          },
        ],
        sources: [{ id: "v1", reference: "VOY-1", type: "VOYAGE" }],
      }),
      message({
        contenu: "Question 2",
        id: "u2",
        role: "user",
        statut: "erreur",
      }),
    ]);
    fixture.detectChanges();

    const statuts = [
      ...compiled.querySelectorAll(".copilote-envoi-statut"),
    ].map((e) => e.textContent?.trim());
    expect(statuts).toEqual(["Envoyé", "Non envoyé"]);
    const markdown = compiled.querySelector(".copilote-markdown");
    expect(markdown?.querySelector("strong")?.textContent).toBe("VOY-1");
    expect(markdown?.querySelector("script")).toBeNull();
    expect(
      compiled.querySelector("a.copilote-source")?.getAttribute("href")
    ).toBe("/voyages/v1");
    expect(
      compiled.querySelector('button[aria-label="Réponse utile"]')
    ).not.toBeNull();
  });

  it("closes on Escape", async () => {
    const { compiled, fixture } = await ouvrir();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();

    expect(compiled.querySelector("aside")).toBeNull();
    expect(TestBed.inject(CopiloteStore).ouvert()).toBe(false);
  });
});
