import { TestBed } from "@angular/core/testing";
import {
  ListTableSkeleton,
  skeletonCellWidthClass,
} from "./list-table-skeleton";

describe("skeletonCellWidthClass", () => {
  it("widens the first column and narrows the action column", () => {
    expect(skeletonCellWidthClass(0, 6)).toBe("max-w-28");
    expect(skeletonCellWidthClass(4, 6)).toBe("max-w-20");
    expect(skeletonCellWidthClass(5, 6)).toBe("max-w-14");
  });
});

describe("ListTableSkeleton", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTableSkeleton],
    }).compileComponents();
  });

  it("renders a status region with skeleton rows", () => {
    const fixture = TestBed.createComponent(ListTableSkeleton);
    fixture.componentRef.setInput("label", "Chargement des dossiers");
    fixture.componentRef.setInput("columns", 6);
    fixture.componentRef.setInput("rows", 3);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="status"]')).toBeTruthy();
    expect(compiled.textContent).toContain("Chargement des dossiers");
    expect(compiled.querySelectorAll("tbody tr").length).toBe(3);
    expect(compiled.querySelectorAll("thead th").length).toBe(6);
  });
});
