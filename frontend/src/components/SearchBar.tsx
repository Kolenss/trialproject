"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useI18n } from "@/i18n/context";
import { RecentSearch } from "@/lib/api";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  recentSearches?: RecentSearch[];
}

export default function SearchBar({ onSearch, isLoading, recentSearches = [] }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query.trim());
    }
  };

  const handleSelect = (q: string) => {
    setQuery(q);
    setShowDropdown(false);
    onSearch(q);
  };

  const filtered = recentSearches.filter((s) =>
    !query.trim() || s.query.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative flex gap-2">
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={t("searchPlaceholder")}
          className="w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:border-transparent hover:border-neutral-300 transition-colors"
          disabled={isLoading}
        />

        {showDropdown && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="px-3 py-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              {t("recentSearches")}
            </div>
            {filtered.map((search) => (
              <button
                key={search.id}
                onClick={() => handleSelect(search.query)}
                className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-neutral-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {search.query}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        onClick={handleSubmit}
        className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? t("loading") : t("searchButton")}
      </button>
    </div>
  );
}
