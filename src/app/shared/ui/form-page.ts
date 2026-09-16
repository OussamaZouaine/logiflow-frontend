import { FormActions } from "./form-actions";
import { FormFieldShell } from "./form-field";
import { FormPageHeader } from "./form-page-header";
import { FormSection } from "./form-section";
import { FormValidationSummary } from "./form-validation-summary";

/** Shared imports for create / edit form pages. */
export const FORM_PAGE_IMPORTS = [
  FormActions,
  FormFieldShell,
  FormPageHeader,
  FormSection,
  FormValidationSummary,
] as const;
