"use client";

import { useI18n } from "@/i18n/context";
import { RecentSearch } from "@/lib/api";

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelect: (query: string) => void;
}

export default function RecentSearches({
  searches,
  onSelect,
}: RecentSearchesProps) {
  const { t } = useI18n();

  if (searches.length === 0) return null;

  return (
    <div className="mt-3">
      <h3 className="text-xs font-medium text-neutral-400 mb-2">
        {t("recentSearches")}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {searches.map((search) => (
          <button
            key={search.id}
            onClick={() => onSelect(search.query)}
            className="bg-white border border-neutral-200 rounded-full px-3 py-1 text-xs text-neutral-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors"
          >
            {search.query}
          </button>
        ))}
      </div>
    </div>
  );
}
