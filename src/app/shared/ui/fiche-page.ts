import { FicheCheckboxRow } from "./fiche-checkbox-row";
import { FicheDangerZone } from "./fiche-danger-zone";
import { FicheError } from "./fiche-error";
import { FicheField } from "./fiche-field";
import { FicheFieldGrid } from "./fiche-field-grid";
import { FicheHeader } from "./fiche-header";
import { FicheTitleRow } from "./fiche-title-row";
import { FORM_PAGE_IMPORTS } from "./form-page";

/** Shared imports for module fiche / detail pages. */
export const FICHE_PAGE_IMPORTS = [
  FicheCheckboxRow,
  FicheDangerZone,
  FicheError,
  FicheField,
  FicheFieldGrid,
  FicheHeader,
  FicheTitleRow,
  ...FORM_PAGE_IMPORTS,
] as const;
