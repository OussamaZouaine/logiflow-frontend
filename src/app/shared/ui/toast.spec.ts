import { TestBed } from "@angular/core/testing";
import { ToastHost, ToastService } from "./toast";

describe("ToastService", () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it("queues a success toast", () => {
    service.success("Enregistré.");
    expect(service.messages()).toEqual([
      { id: 1, message: "Enregistré.", tone: "success" },
    ]);
  });

  it("dismisses a toast by id", () => {
    service.success("Enregistré.");
    service.dismiss(1);
    expect(service.messages()).toEqual([]);
  });
});

describe("ToastHost", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastHost],
      providers: [ToastService],
    }).compileComponents();
  });

  it("renders queued toasts", () => {
    const fixture = TestBed.createComponent(ToastHost);
    const toastService = TestBed.inject(ToastService);
    toastService.success("Statut mis à jour.");
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Statut mis à jour.");
    expect(compiled.querySelector('[role="status"]')).toBeTruthy();
  });
});
