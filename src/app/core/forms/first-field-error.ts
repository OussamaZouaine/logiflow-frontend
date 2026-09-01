export function firstFieldError(
  errors: readonly { message?: string }[]
): string | null {
  const [first] = errors;
  return first?.message ?? null;
}
