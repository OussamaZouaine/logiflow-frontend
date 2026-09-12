import type { Commande } from "../commandes/commande";
import type { Dossier } from "../dossiers/dossier";
import type { PageResponse } from "../core/api/page-response";
import type { WorkDestination } from "../core/nav/work-destination";
import { WORK_DESTINATIONS } from "../core/nav/work-destination";
import type { Vehicule } from "../vehicules/vehicule";
import type { Voyage } from "../voyages/voyage";
import {
  apercuApiPath,
  apercuDestinations,
  apercuToneBorderClass,
  apercuToneClass,
  apercuToneOnFillClass,
  commandeStatutTone,
  vehiculeStatutTone,
  voyageStatutTone,
  commandeStatutSlices,
  dossierStatutSlices,
  isCompleteCollection,
  shouldShowStatutBreakdown,
  vehiculeStatutSlices,
  voyageStatutSlices,
} from "./apercu";

describe("apercuDestinations", () => {
  it("keeps countable modules including maintenance", () => {
    const destinations: WorkDestination[] = [
      WORK_DESTINATIONS.vehicules,
      WORK_DESTINATIONS.maintenance,
      WORK_DESTINATIONS.voyages,
    ];
    expect(apercuDestinations(destinations).map((item) => item.id)).toEqual([
      "vehicules",
      "maintenance",
      "voyages",
    ]);
  });
});

describe("apercuApiPath", () => {
  it("maps maintenance to ordres-travail", () => {
    expect(apercuApiPath("maintenance")).toBe("ordres-travail");
    expect(apercuApiPath("sites")).toBe("sites");
  });
});

describe("shouldShowStatutBreakdown", () => {
  it("hides a breakdown when the page is incomplete", () => {
    const page: PageResponse<{ statut: string }> = {
      content: [{ statut: "DISPONIBLE" }, { statut: "DISPONIBLE" }],
      pageNumber: 0,
      pageSize: 100,
      totalElements: 3,
      totalPages: 1,
    };
    expect(isCompleteCollection(page)).toBe(false);
    expect(shouldShowStatutBreakdown(page)).toBe(false);
  });

  it("hides a breakdown when the count is zero", () => {
    const page: PageResponse<{ statut: string }> = {
      content: [],
      pageNumber: 0,
      pageSize: 100,
      totalElements: 0,
      totalPages: 0,
    };
    expect(isCompleteCollection(page)).toBe(true);
    expect(shouldShowStatutBreakdown(page)).toBe(false);
  });

  it("shows a breakdown when every record is present", () => {
    const page: PageResponse<{ statut: string }> = {
      content: [{ statut: "DISPONIBLE" }],
      pageNumber: 0,
      pageSize: 100,
      totalElements: 1,
      totalPages: 1,
    };
    expect(shouldShowStatutBreakdown(page)).toBe(true);
  });
});

describe("statut slices", () => {
  it("groups véhicules and skips empty statuts", () => {
    const vehicules: Pick<Vehicule, "statut">[] = [
      { statut: "DISPONIBLE" },
      { statut: "DISPONIBLE" },
      { statut: "EN_VOYAGE" },
    ];
    expect(vehiculeStatutSlices(vehicules)).toEqual([
      { count: 2, key: "DISPONIBLE", label: "Disponible", tone: "pine" },
      { count: 1, key: "EN_VOYAGE", label: "En voyage", tone: "ink" },
    ]);
  });

  it("groups voyages in cycle order", () => {
    const voyages: Pick<Voyage, "statut">[] = [
      { statut: "ANNULE" },
      { statut: "PLANIFIE" },
      { statut: "PLANIFIE" },
    ];
    expect(voyageStatutSlices(voyages).map((slice) => slice.key)).toEqual([
      "PLANIFIE",
      "ANNULE",
    ]);
  });

  it("groups commandes", () => {
    const commandes: Pick<Commande, "statut">[] = [
      { statut: "RECUE" },
      { statut: "CONFIRMEE" },
    ];
    expect(commandeStatutSlices(commandes).map((slice) => slice.label)).toEqual(
      ["Reçue", "Confirmée"]
    );
  });

  it("groups dossiers", () => {
    const dossiers: Pick<Dossier, "statut">[] = [
      { statut: "CREE" },
      { statut: "PLANIFIE" },
    ];
    expect(dossierStatutSlices(dossiers).map((slice) => slice.label)).toEqual([
      "Créé",
      "Planifié",
    ]);
  });
});

describe("apercuToneClass", () => {
  it("maps each tone to a surface class", () => {
    expect(apercuToneClass("amber")).toBe("bg-amber");
    expect(apercuToneClass("pine")).toBe("bg-pine");
    expect(apercuToneClass("brake")).toBe("bg-brake");
  });
});

describe("apercuToneBorderClass", () => {
  it("maps each tone to a left border class", () => {
    expect(apercuToneBorderClass("amber")).toBe("border-l-amber");
    expect(apercuToneBorderClass("brake")).toBe("border-l-brake");
  });
});

describe("apercuToneOnFillClass", () => {
  it("uses muted text only on muted fills", () => {
    expect(apercuToneOnFillClass("amber")).toBe("text-surface");
    expect(apercuToneOnFillClass("muted")).toBe("text-muted");
  });
});

describe("statut tone mapping", () => {
  it("marks at-risk statuts with amber", () => {
    expect(commandeStatutTone("RECUE")).toBe("amber");
    expect(voyageStatutTone("PLANIFIE")).toBe("amber");
    expect(voyageStatutTone("EN_COURS")).toBe("pine");
    expect(vehiculeStatutTone("EN_MAINTENANCE")).toBe("amber");
  });
});
