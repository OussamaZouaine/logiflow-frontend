import { validate } from "@angular/forms/signals";

type DateTimeFieldPath = Parameters<typeof validate>[0];

export function validateTimeWindowEndAfterStart(
  finPath: DateTimeFieldPath,
  debutPath: DateTimeFieldPath,
  message: string
): void {
  validate(finPath, (ctx) => {
    const debut = ctx.valueOf(debutPath);
    const fin = ctx.value();
    if (typeof debut !== "string" || typeof fin !== "string") {
      return undefined;
    }
    if (debut.length === 0 || fin.length === 0) {
      return undefined;
    }

    const debutMs = new Date(debut).getTime();
    const finMs = new Date(fin).getTime();
    if (Number.isNaN(debutMs) || Number.isNaN(finMs)) {
      return { kind: "datetime", message: "Date ou heure invalide." };
    }
    if (finMs <= debutMs) {
      return { kind: "windowOrder", message };
    }
    return undefined;
  });
}
