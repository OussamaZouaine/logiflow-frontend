import { httpResource } from "@angular/common/http";
import { computed } from "@angular/core";
import { environment } from "../../environments/environment";
import type { PageResponse } from "../core/api/page-response";
import type { FieldSelectOption } from "../shared/ui/field-select";
import type {
  EnginLookup,
  Prestataire,
  TypeEngin,
  TypePrestataire,
} from "./maintenance";
import { libelle } from "./maintenance";

const TAILLE = 100;

interface EnginPage {
  id: string;
  immatriculation: string;
}

/**
 * Listes de référence du module (engins de la flotte, prestataires) et leurs index. À appeler dans
 * un contexte d'injection (initialiseur de champ d'un composant).
 */
export function creerLookupsMaintenance() {
  const vehicules = httpResource<PageResponse<EnginPage>>(() => ({
    params: { page: 0, size: TAILLE },
    url: `${environment.apiBaseUrl}/vehicules`,
  }));
  const remorques = httpResource<PageResponse<EnginPage>>(() => ({
    params: { page: 0, size: TAILLE },
    url: `${environment.apiBaseUrl}/remorques`,
  }));
  const prestataires = httpResource<PageResponse<Prestataire>>(() => ({
    params: { actif: true, page: 0, size: TAILLE },
    url: `${environment.apiBaseUrl}/maintenance/prestataires`,
  }));

  const engins = computed(() => {
    const index = new Map<string, EnginLookup>();
    for (const v of vehicules.value()?.content ?? []) {
      index.set(v.id, {
        id: v.id,
        immatriculation: v.immatriculation,
        type: "VEHICULE",
      });
    }
    for (const r of remorques.value()?.content ?? []) {
      index.set(r.id, {
        id: r.id,
        immatriculation: r.immatriculation,
        type: "REMORQUE",
      });
    }
    return index as ReadonlyMap<string, EnginLookup>;
  });

  const prestatairesParId = computed(
    () =>
      new Map(
        (prestataires.value()?.content ?? []).map((p) => [p.id, p] as const)
      ) as ReadonlyMap<string, Prestataire>
  );

  return {
    /** Options d'engins d'un type donné (immatriculations triées). */
    enginOptions(type: TypeEngin): FieldSelectOption[] {
      return [...engins().values()]
        .filter((e) => e.type === type)
        .sort((a, b) => a.immatriculation.localeCompare(b.immatriculation))
        .map((e) => ({ label: e.immatriculation, value: e.id }));
    },
    engins,
    prestataireLibelle(id: string | null | undefined): string {
      if (!id) {
        return "Atelier interne";
      }
      return prestatairesParId().get(id)?.raisonSociale ?? "—";
    },
    /** Options de prestataires, filtrées par métier si demandé. */
    prestataireOptions(
      types?: readonly TypePrestataire[]
    ): FieldSelectOption[] {
      return (prestataires.value()?.content ?? [])
        .filter((p) => !types || types.includes(p.type))
        .map((p) => ({
          label: `${p.raisonSociale} (${libelle(p.type)})`,
          value: p.id,
        }));
    },
    prestataires,
    prestatairesParId,
    pret: computed(() => vehicules.hasValue() && remorques.hasValue()),
    remorques,
    vehicules,
  };
}

export type LookupsMaintenance = ReturnType<typeof creerLookupsMaintenance>;
