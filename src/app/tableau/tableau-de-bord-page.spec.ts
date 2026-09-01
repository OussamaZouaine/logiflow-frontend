import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { DEMO_PASSWORD } from "../core/auth/demo-identity";
import { DemoSessionService } from "../core/auth/demo-session";
import { TableauDeBordPage } from "./tableau-de-bord-page";

describe("TableauDeBordPage", () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TableauDeBordPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("shows Sites for an exploitant", () => {
    TestBed.inject(DemoSessionService).signIn("exploitant", DEMO_PASSWORD);
    const fixture = TestBed.createComponent(TableauDeBordPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(text).toContain("Sites");
    expect(text).toContain("Ouvert");
    expect(text).not.toContain("Maintenance");
  });

  it("hides Sites for a chauffeur and offers Voyages", () => {
    TestBed.inject(DemoSessionService).signIn("chauffeur", DEMO_PASSWORD);
    const fixture = TestBed.createComponent(TableauDeBordPage);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(text).toContain("Voyages");
    expect(text).not.toContain("Sites");
  });
});
