import { draftToWrite, emptyVoyageDraft } from "./voyage";

describe("draftToWrite", () => {
  it("maps an empty remorque selection to null", () => {
    const draft = { ...emptyVoyageDraft(), remorqueId: "" };
    expect(draftToWrite(draft, ["dossier-1"]).remorqueId).toBeNull();
  });

  it("keeps a selected remorque id", () => {
    const draft = {
      ...emptyVoyageDraft(),
      remorqueId: "11111111-1111-1111-1111-111111111111",
    };
    expect(draftToWrite(draft, ["dossier-1"]).remorqueId).toBe(
      "11111111-1111-1111-1111-111111111111"
    );
  });
});
