import type { EvenementCopilote } from "./copilote";

const ESPACE_INITIAL = /^ /;

interface EvenementBrut {
  donnees: string;
  nom: string;
}

/**
 * Parseur Server-Sent Events incrémental : les fragments réseau peuvent couper un
 * événement n'importe où, on ne restitue que les événements complets (ligne vide).
 * Accepte `event:x` et `event: x` (Spring n'écrit pas d'espace, Flask si).
 */
export class ParseurSse {
  private tampon = "";

  pousser(fragment: string): EvenementBrut[] {
    this.tampon += fragment.replaceAll("\r\n", "\n");
    const evenements: EvenementBrut[] = [];
    let fin = this.tampon.indexOf("\n\n");
    while (fin >= 0) {
      const bloc = this.tampon.slice(0, fin);
      this.tampon = this.tampon.slice(fin + 2);
      const evenement = lireBloc(bloc);
      if (evenement) {
        evenements.push(evenement);
      }
      fin = this.tampon.indexOf("\n\n");
    }
    return evenements;
  }

  /** Dernier événement éventuellement non terminé par une ligne vide. */
  terminer(): EvenementBrut[] {
    const evenement = lireBloc(this.tampon);
    this.tampon = "";
    return evenement ? [evenement] : [];
  }
}

function lireBloc(bloc: string): EvenementBrut | null {
  let nom: string | null = null;
  const donnees: string[] = [];
  for (const ligne of bloc.split("\n")) {
    if (ligne.startsWith("event:")) {
      nom = ligne.slice("event:".length).trim();
    } else if (ligne.startsWith("data:")) {
      donnees.push(ligne.slice("data:".length).replace(ESPACE_INITIAL, ""));
    }
  }
  if (!nom || donnees.length === 0) {
    return null;
  }
  return { donnees: donnees.join("\n"), nom };
}

/** Convertit un événement brut en événement typé ; null si illisible. */
export function decoderEvenement(
  brut: EvenementBrut
): EvenementCopilote | null {
  try {
    return {
      donnees: JSON.parse(brut.donnees),
      nom: brut.nom,
    } as EvenementCopilote;
  } catch {
    return null;
  }
}
