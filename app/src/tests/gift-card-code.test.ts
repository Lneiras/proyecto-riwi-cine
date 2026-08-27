import { generateGiftCardCode, hashGiftCardCode, normalizeGiftCardCode } from "../utils/giftCardCode";

describe("HU-011 - códigos de gift card", () => {
  it("genera códigos opacos con formato legible", () => {
    expect(generateGiftCardCode()).toMatch(/^CINE-[A-F0-9]{4}(?:-[A-F0-9]{4}){3}$/);
  });
  it("normaliza antes de calcular el hash", () => {
    const code = generateGiftCardCode();
    expect(hashGiftCardCode(`  ${code.toLowerCase()} `)).toBe(hashGiftCardCode(code));
    expect(normalizeGiftCardCode(` ${code.toLowerCase()} `)).toBe(code);
  });
  it("no guarda el código original como hash", () => {
    const code = generateGiftCardCode();
    expect(hashGiftCardCode(code)).not.toContain(code);
    expect(hashGiftCardCode(code)).toHaveLength(64);
  });
});
