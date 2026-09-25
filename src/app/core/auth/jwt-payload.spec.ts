import { describe, expect, it } from "vitest";
import { decoderPayloadJwt, lireRealmRoles } from "./jwt-payload";

describe("jwt-payload", () => {
  it("lit les rôles realm depuis le payload", () => {
    const payload = {
      realm_access: { roles: ["EXPLOITANT", "default-roles-logiflow"] },
    };
    expect(lireRealmRoles(payload)).toEqual([
      "EXPLOITANT",
      "default-roles-logiflow",
    ]);
  });

  it("retourne null pour un jeton invalide", () => {
    expect(decoderPayloadJwt("not-a-jwt")).toBeNull();
  });
});
