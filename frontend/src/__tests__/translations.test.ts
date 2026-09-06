import { describe, it, expect } from "vitest";
import translations, { getTranslations, LOCALE_LABELS } from "@/i18n/translations";
import type { Locale } from "@/i18n/translations";

describe("translations", () => {
  const locales: Locale[] = ["en", "nl", "de", "fr"];
  const referenceKeys = Object.keys(translations.en);

  it("all locales have labels", () => {
    for (const locale of locales) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
    }
  });

  it("all locales have the same keys as English", () => {
    for (const locale of locales) {
      const keys = Object.keys(translations[locale]);
      expect(keys.sort()).toEqual(referenceKeys.sort());
    }
  });

  it("no translation value is empty", () => {
    for (const locale of locales) {
      const t = getTranslations(locale);
      for (const [key, value] of Object.entries(t)) {
        expect(value, `${locale}.${key} is empty`).toBeTruthy();
      }
    }
  });

  it("getTranslations returns the correct locale", () => {
    expect(getTranslations("fr").appTitle).toBe(
      "Recherche de Produits Alimentaires"
    );
    expect(getTranslations("de").appTitle).toBe("Lebensmittel Suche");
  });
});
