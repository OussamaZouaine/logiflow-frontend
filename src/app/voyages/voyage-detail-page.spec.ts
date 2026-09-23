import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { VoyageDetailPage } from "./voyage-detail-page";

const VOYAGE_ID = "55555555-5555-5555-5555-555555555555";

describe("VoyageDetailPage", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoyageDetailPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it("requests fuel stops for the voyage", () => {
    const fixture = TestBed.createComponent(VoyageDetailPage);
    fixture.componentRef.setInput("id", VOYAGE_ID);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    const priseRequest = http.expectOne(
      (req) =>
        req.url === "/api/v1/prises-carburant" &&
        req.params.get("voyageId") === VOYAGE_ID
    );
    expect(priseRequest.request.method).toBe("GET");
    priseRequest.flush({
      content: [],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 0,
      totalPages: 0,
    });

    for (const req of http.match(() => true)) {
      req.flush(req.request.method === "GET" ? [] : {});
    }

    http.verify();
  });
});
