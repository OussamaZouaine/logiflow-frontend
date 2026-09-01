import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CommandeCreatePage } from "./commande-create-page";

describe("CommandeCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the create form", () => {
    const fixture = TestBed.createComponent(CommandeCreatePage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Nouvelle commande");
    expect(compiled.querySelector("#clientCode")).toBeTruthy();
    expect(compiled.querySelector("#dateSouhaitee")).toBeTruthy();
  });
});
