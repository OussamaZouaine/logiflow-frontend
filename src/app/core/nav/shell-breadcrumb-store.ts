import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ShellBreadcrumbStore {
  readonly leafLabel = signal<string | null>(null);

  setLeaf(label: string | null): void {
    this.leafLabel.set(label);
  }

  clearLeaf(): void {
    this.leafLabel.set(null);
  }
}
