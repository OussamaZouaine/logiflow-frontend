import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { FicheHeader } from "./fiche-header";

describe("FicheHeader", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheHeader],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("renders the back link to the list module", () => {
    const fixture = TestBed.createComponent(FicheHeader);
    fixture.componentRef.setInput("listLink", "/voyages");
    fixture.componentRef.setInput("listLabel", "Voyages");
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const link = host.querySelector("a");
    expect(link?.textContent?.trim()).toBe("← Voyages");
    expect(link?.getAttribute("href")).toBe("/voyages");
    expect(host.className).toContain("sticky");
  });
});
