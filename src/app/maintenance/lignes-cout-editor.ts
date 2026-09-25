import { Component, computed, input, output } from "@angular/core";
import {
  enumToSelectOptions,
  FieldSelectComponent,
} from "../shared/ui/field-select";
import {
  formatEur,
  type LigneCout,
  libelle,
  ligneVide,
  nombreOuNull,
  TYPES_LIGNE,
  totalHtLigne,
  totauxLignes,
} from "./maintenance";

/**
 * Éditeur des lignes de coût d'un ordre de travail (main-d'œuvre, pièces, sous-traitance…) avec
 * totaux HT, TVA et TTC. En lecture seule quand {@code editable} est faux.
 */
@Component({
  imports: [FieldSelectComponent],
  selector: "app-lignes-cout-editor",
  template: `
    <div class="overflow-x-auto">
      <table class="w-full min-w-2xl text-left text-sm">
        <thead class="list-table-head">
          <tr>
            <th class="px-2 py-2 font-medium" scope="col">Type</th>
            <th class="px-2 py-2 font-medium" scope="col">Désignation</th>
            <th class="px-2 py-2 font-medium" scope="col">Réf. pièce</th>
            <th class="w-20 px-2 py-2 font-medium" scope="col">Qté</th>
            <th class="w-28 px-2 py-2 font-medium" scope="col">PU HT</th>
            <th class="w-20 px-2 py-2 font-medium" scope="col">TVA %</th>
            <th class="w-28 px-2 py-2 text-right font-medium" scope="col">Total HT</th>
            @if (editable()) {
            <th class="w-10 px-2 py-2" scope="col"><span class="sr-only">Retirer</span></th>
            }
          </tr>
        </thead>
        <tbody>
          @for (ligne of lignes(); track $index; let i = $index) {
          <tr class="border-b border-line last:border-0 align-top">
            @if (editable()) {
            <td class="px-2 py-1.5">
              <app-field-select
                (selectValueChange)="modifier(i, { type: $any($event) })"
                [inputId]="'ligne-type-' + i"
                [options]="typeOptions"
                [selectValue]="ligne.type"
              />
            </td>
            <td class="px-2 py-1.5">
              <input
                (input)="modifier(i, { designation: valeur($event) })"
                [attr.aria-label]="'Désignation ligne ' + (i + 1)"
                [value]="ligne.designation"
                class="field w-full"
                type="text"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                (input)="modifier(i, { referencePiece: valeur($event) || null })"
                [attr.aria-label]="'Référence pièce ligne ' + (i + 1)"
                [value]="ligne.referencePiece ?? ''"
                class="field w-full font-mono text-xs"
                type="text"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                (input)="modifier(i, { quantite: nombre($event) ?? 0 })"
                [attr.aria-label]="'Quantité ligne ' + (i + 1)"
                [value]="ligne.quantite"
                class="field w-full tabular-nums"
                inputmode="decimal"
                type="text"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                (input)="modifier(i, { prixUnitaireHt: nombre($event) ?? 0 })"
                [attr.aria-label]="'Prix unitaire HT ligne ' + (i + 1)"
                [value]="ligne.prixUnitaireHt"
                class="field w-full tabular-nums"
                inputmode="decimal"
                type="text"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                (input)="modifier(i, { tauxTva: nombre($event) })"
                [attr.aria-label]="'Taux de TVA ligne ' + (i + 1)"
                [value]="ligne.tauxTva ?? 20"
                class="field w-full tabular-nums"
                inputmode="decimal"
                type="text"
              >
            </td>
            } @else {
            <td class="px-2 py-2 text-muted">{{ libelle(ligne.type) }}</td>
            <td class="px-2 py-2 text-ink">{{ ligne.designation }}</td>
            <td class="px-2 py-2 font-mono text-xs">{{ ligne.referencePiece ?? "—" }}</td>
            <td class="px-2 py-2 tabular-nums">{{ ligne.quantite }}</td>
            <td class="px-2 py-2 tabular-nums">{{ formatEur(ligne.prixUnitaireHt) }}</td>
            <td class="px-2 py-2 tabular-nums">{{ ligne.tauxTva ?? 20 }}</td>
            }
            <td class="px-2 py-2 text-right font-mono text-xs tabular-nums">
              {{ formatEur(totalHtLigne(ligne)) }}
            </td>
            @if (editable()) {
            <td class="px-2 py-1.5">
              <button
                (click)="retirer(i)"
                [attr.aria-label]="'Retirer la ligne ' + (i + 1)"
                class="pressable rounded px-2 py-1 text-brake"
                type="button"
              >
                ×
              </button>
            </td>
            }
          </tr>
          } @empty {
          <tr>
            <td class="px-2 py-3 text-sm text-muted" colspan="8">Aucune ligne de coût.</td>
          </tr>
          }
        </tbody>
        <tfoot class="text-sm">
          <tr>
            <td class="px-2 pt-3 text-right text-muted" colspan="6">Total HT</td>
            <td class="px-2 pt-3 text-right font-mono tabular-nums">{{ formatEur(totaux().ht) }}</td>
          </tr>
          <tr>
            <td class="px-2 text-right text-muted" colspan="6">TVA</td>
            <td class="px-2 text-right font-mono tabular-nums">{{ formatEur(totaux().tva) }}</td>
          </tr>
          <tr>
            <td class="px-2 text-right font-medium text-ink" colspan="6">Total TTC</td>
            <td class="px-2 text-right font-mono font-medium tabular-nums text-ink">
              {{ formatEur(totaux().ttc) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    @if (editable()) {
    <button
      (click)="ajouter()"
      class="btn-outline pressable mt-3 min-h-10 px-4 text-sm"
      type="button"
    >
      Ajouter une ligne
    </button>
    }
  `,
})
export class LignesCoutEditor {
  readonly lignes = input.required<readonly LigneCout[]>();
  readonly editable = input(true);
  readonly lignesChange = output<LigneCout[]>();

  protected readonly typeOptions = enumToSelectOptions(TYPES_LIGNE, libelle);
  protected readonly formatEur = formatEur;
  protected readonly libelle = libelle;
  protected readonly totalHtLigne = totalHtLigne;
  protected readonly totaux = computed(() => totauxLignes(this.lignes()));

  protected ajouter(): void {
    this.lignesChange.emit([...this.lignes(), ligneVide()]);
  }

  protected retirer(index: number): void {
    this.lignesChange.emit(this.lignes().filter((_, i) => i !== index));
  }

  protected modifier(index: number, changement: Partial<LigneCout>): void {
    if (
      changement.type !== undefined &&
      !(TYPES_LIGNE as readonly string[]).includes(changement.type)
    ) {
      return;
    }
    this.lignesChange.emit(
      this.lignes().map((l, i) => (i === index ? { ...l, ...changement } : l))
    );
  }

  protected valeur(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : "";
  }

  protected nombre(event: Event): number | null {
    return nombreOuNull(this.valeur(event));
  }
}
