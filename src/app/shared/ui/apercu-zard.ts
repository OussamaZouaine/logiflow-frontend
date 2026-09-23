import type { ZardBadgeTypeVariants } from "@/shared/components/badge/badge.variants";
import type { ApercuTone } from "../../tableau/apercu";

/** Maps domain status tones to Zard badge variants. */
export function apercuToneToBadgeType(tone: ApercuTone): ZardBadgeTypeVariants {
  switch (tone) {
    case "pine":
      return "default";
    case "amber":
      return "secondary";
    case "brake":
      return "destructive";
    case "ink":
      return "outline";
    case "muted":
      return "secondary";
    default: {
      const _exhaustive: never = tone;
      return _exhaustive;
    }
  }
}
