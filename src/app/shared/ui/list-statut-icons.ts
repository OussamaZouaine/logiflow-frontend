import { provideIcons } from "@ng-icons/core";
import {
  lucideArchive,
  lucideBookmark,
  lucideCalendar,
  lucideCalendarClock,
  lucideCircleCheck,
  lucideCircleOff,
  lucideCirclePause,
  lucideCircleX,
  lucideFilePlus,
  lucideFlag,
  lucideInbox,
  lucideMapPin,
  lucidePackage,
  lucidePackageCheck,
  lucidePencil,
  lucidePlay,
  lucideRoute,
  lucideTriangleAlert,
  lucideTruck,
  lucideUserCheck,
  lucideWrench,
} from "@ng-icons/lucide";
import type { StatutPrise } from "../../carburant/prise-carburant";
import type {
  ChauffeurDisponibilite,
  ChauffeurStatut,
} from "../../chauffeurs/chauffeur";
import type { StatutCommande } from "../../commandes/commande";
import type { StatutDossier } from "../../dossiers/dossier";
import type { StatutOT } from "../../maintenance/ordre-travail";
import type { VehiculeStatut } from "../../vehicules/vehicule";
import type { StatutVoyage } from "../../voyages/voyage";

export function commandeStatutIcon(statut: StatutCommande): string {
  switch (statut) {
    case "RECUE":
      return "lucideInbox";
    case "CONFIRMEE":
      return "lucideCircleCheck";
    case "ANNULEE":
      return "lucideCircleX";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function dossierStatutIcon(statut: StatutDossier): string {
  switch (statut) {
    case "CREE":
      return "lucideFilePlus";
    case "PLANIFIE":
      return "lucideCalendar";
    case "EN_CHARGEMENT":
      return "lucidePackage";
    case "CHARGE":
      return "lucidePackageCheck";
    case "EN_TRANSIT":
      return "lucideRoute";
    case "EN_LIVRAISON":
      return "lucideMapPin";
    case "LIVRE":
      return "lucideCircleCheck";
    case "CLOTURE":
      return "lucideArchive";
    case "INCIDENT":
      return "lucideTriangleAlert";
    case "ANNULE":
      return "lucideCircleX";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function voyageStatutIcon(statut: StatutVoyage): string {
  switch (statut) {
    case "BROUILLON":
      return "lucidePencil";
    case "PLANIFIE":
      return "lucideCalendarClock";
    case "AFFECTE":
      return "lucideUserCheck";
    case "EN_COURS":
      return "lucideTruck";
    case "TERMINE":
      return "lucideFlag";
    case "CLOTURE":
      return "lucideArchive";
    case "ANNULE":
      return "lucideCircleX";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function vehiculeStatutIcon(statut: VehiculeStatut): string {
  switch (statut) {
    case "DISPONIBLE":
      return "lucideCircleCheck";
    case "RESERVE":
      return "lucideBookmark";
    case "EN_VOYAGE":
      return "lucideRoute";
    case "EN_MAINTENANCE":
      return "lucideWrench";
    case "IMMOBILISE":
      return "lucideCirclePause";
    case "HORS_SERVICE":
      return "lucideCircleOff";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function chauffeurDisponibiliteIcon(
  disponibilite: ChauffeurDisponibilite
): string {
  switch (disponibilite) {
    case "DISPONIBLE":
      return "lucideCircleCheck";
    case "EN_VOYAGE":
      return "lucideRoute";
    case "EN_REPOS":
      return "lucideCirclePause";
    case "EN_CONGE":
      return "lucideCalendar";
    case "INDISPONIBLE":
      return "lucideCircleOff";
    default: {
      const _exhaustive: never = disponibilite;
      return _exhaustive;
    }
  }
}

export function chauffeurStatutIcon(statut: ChauffeurStatut): string {
  switch (statut) {
    case "ACTIF":
      return "lucideCircleCheck";
    case "INACTIF":
      return "lucideCircleOff";
    case "SUSPENDU":
      return "lucideTriangleAlert";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function ordreTravailStatutIcon(statut: StatutOT): string {
  switch (statut) {
    case "PLANIFIE":
      return "lucideCalendarClock";
    case "EN_COURS":
      return "lucidePlay";
    case "TERMINE":
      return "lucideCircleCheck";
    case "ANNULE":
      return "lucideCircleX";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

export function priseCarburantStatutIcon(statut: StatutPrise): string {
  switch (statut) {
    case "BROUILLON":
      return "lucidePencil";
    case "VALIDEE":
      return "lucideCircleCheck";
    default: {
      const _exhaustive: never = statut;
      return _exhaustive;
    }
  }
}

/** Icons used in list statut filter menus and matching table chips. */
export const LIST_STATUT_FILTER_ICON_PROVIDERS = provideIcons({
  lucideArchive,
  lucideBookmark,
  lucideCalendar,
  lucideCalendarClock,
  lucideCircleCheck,
  lucideCircleOff,
  lucideCirclePause,
  lucideCircleX,
  lucideFilePlus,
  lucideFlag,
  lucideInbox,
  lucideMapPin,
  lucidePackage,
  lucidePackageCheck,
  lucidePencil,
  lucidePlay,
  lucideRoute,
  lucideTriangleAlert,
  lucideTruck,
  lucideUserCheck,
  lucideWrench,
});
