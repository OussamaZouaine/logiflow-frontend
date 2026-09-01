import { HttpErrorResponse } from "@angular/common/http";

export function httpErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return "Backend injoignable. Démarre logiflow-backend (`make run`) puis recharge.";
    }
    const fromBody = problemDetailMessage(error);
    if (fromBody) {
      return fromBody;
    }
    return `Erreur ${error.status} : ${error.statusText}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Chargement impossible.";
}

function problemDetailMessage(error: HttpErrorResponse): string | null {
  const body: unknown = error.error;
  if (typeof body !== "object" || body === null) {
    return null;
  }

  if ("violations" in body && Array.isArray(body.violations)) {
    const [first] = body.violations;
    if (typeof first === "string" && first.length > 0) {
      return first;
    }
  }

  if (
    "detail" in body &&
    typeof body.detail === "string" &&
    body.detail.length > 0
  ) {
    return body.detail;
  }

  return null;
}
