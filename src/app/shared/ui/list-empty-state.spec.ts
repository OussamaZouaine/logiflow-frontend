import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { ListEmptyState } from "./list-empty-state";

@Component({
  imports: [ListEmptyState],
  template: `
    <app-list-empty-state
      actionLabel="Nouveau site"
      actionLink="/sites/nouveau"
      description="Créez le premier quai."
      title="Aucun site en base"
    />
  `,
})
class HostWithLink {}

@Component({
  imports: [ListEmptyState],
  template: `
    <app-list-empty-state
      (action)="cleared = true"
      actionLabel="Réinitialiser les filtres"
      title="Aucun site pour ce filtre"
    />
  `,
})
class HostWithButton {
  cleared = false;
}

describe("ListEmptyState", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostWithLink, HostWithButton],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("renders a create CTA link when actionLink is set", () => {
    const fixture = TestBed.createComponent(HostWithLink);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Aucun site en base");
    expect(compiled.textContent).toContain("Nouveau site");
    const link = compiled.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/sites/nouveau");
  });

  it("emits action when the secondary button is clicked", () => {
    const fixture = TestBed.createComponent(HostWithButton);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      "button"
    );
    button?.click();
    expect(host.cleared).toBe(true);
  });
});
