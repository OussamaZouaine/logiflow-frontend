import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { SiteCreatePage } from "./site-create-page";

describe("SiteCreatePage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteCreatePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("renders the create form", () => {
    const fixture = TestBed.createComponent(SiteCreatePage);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Nouveau site");
    expect(compiled.querySelector("#code")).toBeTruthy();
  });
});
