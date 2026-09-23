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

  it("renders projected content without a list back link", () => {
    const fixture = TestBed.createComponent(FicheHeader);
    fixture.componentRef.setInput("icon", "lucideBuilding2");
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector("a")).toBeNull();
    expect(host.querySelector(".inner-page-header")).not.toBeNull();
  });
});
