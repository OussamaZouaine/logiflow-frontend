import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { CopilotePanel } from "./copilote-panel";

describe("CopilotePanel", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotePanel],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it("opens the panel and submits a question", async () => {
    const fixture = TestBed.createComponent(CopilotePanel);
    const component = fixture.componentInstance as CopilotePanel & {
      onSubmit: (event: SubmitEvent) => Promise<void>;
      question: { set: (value: string) => void };
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector("button")?.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain("Question en langage naturel");

    component.question.set("Quels camions sont libres demain ?");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    const submitPromise = component.onSubmit({
      preventDefault() {},
    } as SubmitEvent);

    const req = http.expectOne(
      (request) => request.url === "/api/v1/ia/copilote/questions"
    );
    expect(req.request.body).toEqual({
      question: "Quels camions sont libres demain ?",
    });
    req.flush({
      confiance: 0.82,
      reponse: "3 véhicules disponibles.",
      sources: ["vehicule:GP-001-AF"],
    });

    await submitPromise;
    fixture.detectChanges();

    expect(compiled.textContent).toContain("3 véhicules disponibles.");
    expect(compiled.textContent).toContain("Confiance 82 %");
    http.verify();
  });

  it("shows a 503 message when the IA service is unavailable", async () => {
    const fixture = TestBed.createComponent(CopilotePanel);
    const component = fixture.componentInstance as CopilotePanel & {
      onSubmit: (event: SubmitEvent) => Promise<void>;
      question: { set: (value: string) => void };
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector("button")?.click();
    fixture.detectChanges();

    component.question.set("Question test");
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    const submitPromise = component.onSubmit({
      preventDefault() {},
    } as SubmitEvent);

    http
      .expectOne((request) => request.url === "/api/v1/ia/copilote/questions")
      .flush(
        { detail: "Service IA indisponible." },
        { status: 503, statusText: "Service Unavailable" }
      );

    await submitPromise;
    fixture.detectChanges();

    expect(compiled.textContent).toContain("Service IA indisponible.");
    http.verify();
  });
});
