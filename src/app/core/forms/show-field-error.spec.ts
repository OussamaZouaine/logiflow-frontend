import { fieldClasses, showFieldError } from "./show-field-error";

describe("showFieldError", () => {
  it("is false when the field is valid", () => {
    expect(
      showFieldError({
        invalid: () => false,
        touched: () => true,
      })
    ).toBe(false);
  });

  it("is false when invalid but untouched", () => {
    expect(
      showFieldError({
        invalid: () => true,
        touched: () => false,
      })
    ).toBe(false);
  });

  it("is true when invalid and touched", () => {
    expect(
      showFieldError({
        invalid: () => true,
        touched: () => true,
      })
    ).toBe(true);
  });
});

describe("fieldClasses", () => {
  it("adds the invalid modifier after a failed interaction", () => {
    expect(
      fieldClasses({
        invalid: () => true,
        touched: () => true,
      })
    ).toBe("field field--invalid");
  });
});
