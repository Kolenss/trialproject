"use client";

import { useI18n } from "@/i18n/context";

export type SortOption =
  | "relevance"
  | "proteins"
  | "energyKcal"
  | "fat"
  | "carbohydrates"
  | "sugars"
  | "fiber"
  | "salt";

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortSelector({ value, onChange }: SortSelectorProps) {
  const { t } = useI18n();

  const options: { value: SortOption; label: string }[] = [
    { value: "relevance", label: "Relevance" },
    { value: "proteins", label: t("proteins") },
    { value: "energyKcal", label: t("energy") },
    { value: "fat", label: t("fat") },
    { value: "carbohydrates", label: t("carbohydrates") },
    { value: "sugars", label: t("sugars") },
    { value: "fiber", label: t("fiber") },
    { value: "salt", label: t("salt") },
  ];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-medium text-neutral-400 whitespace-nowrap">
        Sort by:
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="appearance-none border border-neutral-200 rounded-lg pl-3 pr-7 py-1.5 text-sm bg-white text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:border-transparent cursor-pointer hover:border-neutral-300 transition-colors"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
