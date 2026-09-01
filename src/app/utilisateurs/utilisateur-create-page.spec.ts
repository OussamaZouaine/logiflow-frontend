import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { UtilisateurCreatePage } from "./utilisateur-create-page";

describe("UtilisateurCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilisateurCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the create form", () => {
    const fixture = TestBed.createComponent(UtilisateurCreatePage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Nouvel utilisateur");
    expect(compiled.querySelector("#login")).toBeTruthy();
    expect(compiled.querySelector("#email")).toBeTruthy();
  });
});
