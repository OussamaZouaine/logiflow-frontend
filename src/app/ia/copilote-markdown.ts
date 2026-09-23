/**
 * Rendu Markdown minimal et sûr pour les réponses du copilote : tout le texte est
 * échappé AVANT d'appliquer la syntaxe, si bien qu'aucune balise venant du LLM ne
 * peut être injectée (Angular assainit de toute façon [innerHTML] en plus).
 *
 * Couvre ce que produit le LLM : titres, paragraphes, listes, tableaux simples,
 * blocs de code, `code`, **gras**, *italique*.
 */

const ECHAPPEMENTS: Readonly<Record<string, string>> = {
  "'": "&#39;",
  '"': "&quot;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

const CARACTERES_HTML = /[&<>"']/g;
const CODE_EN_LIGNE = /(`[^`]+`)/;
const GRAS_ETOILES = /\*\*(.+?)\*\*/g;
const GRAS_SOULIGNES = /__(.+?)__/g;
const ITALIQUE = /(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g;
const BORD_GAUCHE_TABLEAU = /^\|/;
const BORD_DROIT_TABLEAU = /\|$/;
const CLOTURE_CODE = /```[^\n]*\n?/;
const SAUT_FINAL = /\n$/;

export function echapperHtml(texte: string): string {
  return texte.replace(CARACTERES_HTML, (c) => ECHAPPEMENTS[c] ?? c);
}

function enLigne(texte: string): string {
  const morceaux = echapperHtml(texte).split(CODE_EN_LIGNE);
  return morceaux
    .map((morceau) => {
      if (
        morceau.startsWith("`") &&
        morceau.endsWith("`") &&
        morceau.length > 2
      ) {
        return `<code>${morceau.slice(1, -1)}</code>`;
      }
      return morceau
        .replace(GRAS_ETOILES, "<strong>$1</strong>")
        .replace(GRAS_SOULIGNES, "<strong>$1</strong>")
        .replace(ITALIQUE, "$1<em>$2</em>");
    })
    .join("");
}

const TITRE = /^(#{1,4})\s+(.*)$/;
const PUCE = /^\s*[-*+]\s+(.*)$/;
const NUMERO = /^\s*\d+[.)]\s+(.*)$/;
const LIGNE_TABLEAU = /^\s*\|.*\|\s*$/;
const SEPARATEUR_TABLEAU = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function cellules(ligne: string): string[] {
  return ligne
    .trim()
    .replace(BORD_GAUCHE_TABLEAU, "")
    .replace(BORD_DROIT_TABLEAU, "")
    .split("|")
    .map((c) => c.trim());
}

function tableau(lignes: string[]): string {
  const [entete, , ...corps] = lignes;
  const th = cellules(entete ?? "")
    .map((c) => `<th>${enLigne(c)}</th>`)
    .join("");
  const tr = corps
    .map(
      (l) =>
        `<tr>${cellules(l)
          .map((c) => `<td>${enLigne(c)}</td>`)
          .join("")}</tr>`
    )
    .join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

function liste(lignes: string[], motif: RegExp, balise: "ol" | "ul"): string {
  const items = lignes
    .map((l) => `<li>${enLigne(l.replace(motif, "$1"))}</li>`)
    .join("");
  return `<${balise}>${items}</${balise}>`;
}

/** Consomme les lignes consécutives vérifiant `test` à partir de `debut`. */
function bloc(
  lignes: string[],
  debut: number,
  test: (ligne: string) => boolean
): string[] {
  const resultat: string[] = [];
  for (const ligne of lignes.slice(debut)) {
    if (!test(ligne)) {
      break;
    }
    resultat.push(ligne);
  }
  return resultat;
}

function blocsTexte(texte: string): string {
  const lignes = texte.split("\n");
  const html: string[] = [];
  let i = 0;
  while (i < lignes.length) {
    const ligne = lignes[i] ?? "";
    const titre = TITRE.exec(ligne);
    if (ligne.trim() === "") {
      i += 1;
    } else if (titre) {
      const niveau = Math.min((titre[1] ?? "#").length + 2, 6);
      html.push(`<h${niveau}>${enLigne(titre[2] ?? "")}</h${niveau}>`);
      i += 1;
    } else if (
      LIGNE_TABLEAU.test(ligne) &&
      SEPARATEUR_TABLEAU.test(lignes[i + 1] ?? "")
    ) {
      const lignesTableau = bloc(lignes, i, (l) => LIGNE_TABLEAU.test(l));
      html.push(tableau(lignesTableau));
      i += lignesTableau.length;
    } else if (PUCE.test(ligne)) {
      const items = bloc(lignes, i, (l) => PUCE.test(l));
      html.push(liste(items, PUCE, "ul"));
      i += items.length;
    } else if (NUMERO.test(ligne)) {
      const items = bloc(lignes, i, (l) => NUMERO.test(l));
      html.push(liste(items, NUMERO, "ol"));
      i += items.length;
    } else {
      const paragraphe = bloc(
        lignes,
        i,
        (l) =>
          l.trim() !== "" &&
          !TITRE.test(l) &&
          !PUCE.test(l) &&
          !NUMERO.test(l) &&
          !LIGNE_TABLEAU.test(l)
      );
      html.push(`<p>${paragraphe.map(enLigne).join("<br>")}</p>`);
      i += Math.max(paragraphe.length, 1);
    }
  }
  return html.join("");
}

export function renderMarkdown(source: string): string {
  // Les blocs ``` sont isolés d'abord : leur contenu n'est jamais interprété.
  const parties = source.replaceAll("\r\n", "\n").split(CLOTURE_CODE);
  return parties
    .map((partie, index) =>
      index % 2 === 1
        ? `<pre><code>${echapperHtml(partie.replace(SAUT_FINAL, ""))}</code></pre>`
        : blocsTexte(partie)
    )
    .join("");
}
