import {
  afficherEtat,
  COPILOTE_QUESTION_MAX_LENGTH,
  canSubmitCopiloteQuestion,
  formatDateRelative,
  formatDuree,
  libelleTypeSource,
  routeSource,
} from "./copilote";

describe("copilote service status", () => {
  const ok = {
    base: "UP",
    fournisseur: "api.groq.com",
    llm: "UP",
    modele: "llama-3.3-70b-versatile",
    operationnel: true,
    serviceIa: true,
  };
  const libelle = (
    partiel: Partial<typeof ok> & { backendJoignable?: boolean }
  ) => afficherEtat({ ...ok, operationnel: false, ...partiel }).libelle;

  it("maps technical states to a badge", () => {
    expect(afficherEtat(null).niveau).toBe("verification");
    expect(afficherEtat(ok)).toMatchObject({
      libelle: "En ligne",
      niveau: "ok",
    });
    expect(afficherEtat(ok).detail).toContain("api.groq.com");
    expect(libelle({ backendJoignable: false })).toBe("Backend injoignable");
    expect(libelle({ serviceIa: false })).toBe("Service IA hors ligne");
    expect(libelle({ llm: "CLE_ABSENTE" })).toBe("Clé API manquante");
    expect(libelle({ llm: "CLE_INVALIDE" })).toBe("Clé API invalide");
    expect(libelle({ llm: "MODELE_ABSENT" })).toBe("Modèle introuvable");
    expect(libelle({ llm: "DOWN" })).toBe("Fournisseur IA injoignable");
    expect(libelle({ base: "DOWN" })).toBe("Base IA indisponible");
  });

  it("tells how to fix a missing API key", () => {
    expect(
      afficherEtat({ ...ok, llm: "CLE_ABSENTE", operationnel: false }).detail
    ).toContain("LLM_API_KEY");
  });
});

describe("copilote time formatting", () => {
  const maintenant = Date.parse("2026-09-24T12:00:00Z");

  it("formats relative dates for the history", () => {
    expect(formatDateRelative("2026-09-24T11:59:40Z", maintenant)).toBe(
      "à l'instant"
    );
    expect(formatDateRelative("2026-09-24T11:55:00Z", maintenant)).toBe(
      "il y a 5 min"
    );
    expect(formatDateRelative("2026-09-24T09:00:00Z", maintenant)).toBe(
      "il y a 3 h"
    );
    expect(formatDateRelative("2026-09-23T08:00:00Z", maintenant)).toBe("hier");
    expect(formatDateRelative("2026-09-10T08:00:00Z", maintenant)).toBe(
      "10 sept."
    );
  });

  it("formats elapsed durations", () => {
    expect(formatDuree(8400)).toBe("8 s");
    expect(formatDuree(65_000)).toBe("1 min 05 s");
  });
});

describe("copilote helpers", () => {
  it("validates question length", () => {
    expect(canSubmitCopiloteQuestion("")).toBe(false);
    expect(canSubmitCopiloteQuestion("   ")).toBe(false);
    expect(canSubmitCopiloteQuestion("Quels camions sont libres ?")).toBe(true);
    expect(
      canSubmitCopiloteQuestion("x".repeat(COPILOTE_QUESTION_MAX_LENGTH + 1))
    ).toBe(false);
  });

  it("maps cited sources to detail pages", () => {
    expect(
      routeSource({ id: "v-1", reference: "VOY-2026-00003", type: "VOYAGE" })
    ).toBe("/voyages/v-1");
    expect(
      routeSource({ id: "d-1", reference: "DOS-1", type: "DOSSIER" })
    ).toBe("/dossiers/d-1");
    expect(
      routeSource({ id: "c-1", reference: "Jean Dupont", type: "CHAUFFEUR" })
    ).toBeNull();
    expect(
      routeSource({ id: null, reference: "VOY-1", type: "VOYAGE" })
    ).toBeNull();
  });

  it("labels source types", () => {
    expect(libelleTypeSource("VEHICULE")).toBe("Véhicule");
    expect(libelleTypeSource("INCONNU")).toBe("INCONNU");
  });
});
