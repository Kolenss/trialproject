"use client";

import { useI18n } from "@/i18n/context";
import { Locale, LOCALE_LABELS } from "@/i18n/translations";

export default function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor="language-select" className="hidden sm:block text-xs font-medium text-neutral-400">
        {t("language")}:
      </label>
      <div className="relative">
        <select
          id="language-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="appearance-none border border-neutral-200 rounded-lg pl-2.5 pr-6 py-1.5 text-xs sm:text-sm bg-white text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:border-transparent cursor-pointer hover:border-neutral-300 transition-colors"
        >
          {(Object.entries(LOCALE_LABELS) as [Locale, string][]).map(
            ([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            )
          )}
        </select>
        <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
