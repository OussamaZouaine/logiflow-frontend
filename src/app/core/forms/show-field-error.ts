export interface FieldValidationState {
  invalid: () => boolean;
  touched: () => boolean;
}

export function showFieldError(field: FieldValidationState): boolean {
  return field.invalid() && field.touched();
}

export function fieldClasses(
  field: FieldValidationState,
  baseClass = "field"
): string {
  return showFieldError(field) ? `${baseClass} field--invalid` : baseClass;
}
