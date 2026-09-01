import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { VehiculeCreatePage } from "./vehicule-create-page";

describe("VehiculeCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the create form", () => {
    const fixture = TestBed.createComponent(VehiculeCreatePage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Nouveau véhicule");
    expect(compiled.querySelector("#immatriculation")).toBeTruthy();
  });
});
