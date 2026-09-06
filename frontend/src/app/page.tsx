"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useI18n } from "@/i18n/context";
import LanguageSelector from "@/components/LanguageSelector";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import SortSelector, { SortOption } from "@/components/SortSelector";
import {
  searchProducts,
  saveSearch,
  getRecentSearches,
  getUserInfo,
  createCheckoutSession,
  Product,
  RecentSearch,
} from "@/lib/api";

const FEATURED_CATEGORIES = [
  { label: "Fruits", query: "fruit", emoji: "🍎" },
  { label: "Dairy", query: "milk", emoji: "🥛" },
  { label: "Bread", query: "bread", emoji: "🍞" },
  { label: "Snacks", query: "chips", emoji: "🍟" },
  { label: "Drinks", query: "juice", emoji: "🧃" },
  { label: "Cereal", query: "cereal", emoji: "🥣" },
];

export default function Home() {
  const { t, locale } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentQuery, setCurrentQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("a");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [initialLoaded, setInitialLoaded] = useState(false);

  const loadRecentSearches = useCallback(async () => {
    try {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    } catch {
      // non-critical
    }
  }, []);

  const loadUserInfo = useCallback(async () => {
    try {
      const user = await getUserInfo();
      setSubscriptionStatus(user.subscriptionStatus);
      setHasSubscription(user.subscriptionStatus === "active");
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    loadRecentSearches();
    loadUserInfo();
  }, [loadRecentSearches, loadUserInfo]);

  const handleSearch = useCallback(
    async (query: string, searchPage: number = 1, isInitial: boolean = false) => {
      setIsLoading(true);
      setError(null);
      setCurrentQuery(isInitial ? "" : query);
      setActiveQuery(query);
      setPage(searchPage);

      try {
        const result = await searchProducts(query, locale, searchPage);
        setProducts(result.products);
        setTotal(result.total);
        setHasSubscription(result.hasSubscription);

        if (searchPage === 1 && !isInitial) {
          saveSearch(query, locale).then(() => loadRecentSearches());
        }
      } catch {
        setError(t("errorFetching"));
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [locale, t, loadRecentSearches]
  );

  // Auto-load products on landing
  useEffect(() => {
    if (!initialLoaded) {
      setInitialLoaded(true);
      handleSearch("a", 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = async () => {
    try {
      const url = await createCheckoutSession();
      if (url) {
        window.location.href = url;
      }
    } catch {
      alert("Stripe is not configured yet. Please set up Stripe keys.");
    }
  };

  const sortedProducts = useMemo(() => {
    if (sortBy === "relevance") return products;
    return [...products].sort((a, b) => {
      const aVal = a.nutrients?.[sortBy] ?? -1;
      const bVal = b.nutrients?.[sortBy] ?? -1;
      return (bVal as number) - (aVal as number);
    });
  }, [products, sortBy]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg"
              alt="Open Food Facts"
              className="h-7 sm:h-8"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <SearchBar
              onSearch={(q) => handleSearch(q)}
              isLoading={isLoading}
              recentSearches={recentSearches}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SubscriptionBanner
              status={subscriptionStatus}
              onSubscribe={handleSubscribe}
            />
            <LanguageSelector />
          </div>
        </div>

        <div className="md:hidden px-4 pb-2.5">
          <SearchBar
            onSearch={(q) => handleSearch(q)}
            isLoading={isLoading}
            recentSearches={recentSearches}
          />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Category quick links — show when no active search */}
        {!currentQuery && !isLoading && products.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-neutral-900">
                Explore Products
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {FEATURED_CATEGORIES.map((cat) => (
                <button
                  key={cat.query}
                  onClick={() => handleSearch(cat.query)}
                  className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-full px-4 py-2 text-sm text-neutral-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors"
                >
                  <span>{cat.emoji}</span>
                  <span className="font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mt-20 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-neutral-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-neutral-400 text-sm">{t("loading")}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && products.length > 0 && (
          <>
            {/* Results header — only show for user-initiated searches */}
            {currentQuery && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    &ldquo;{currentQuery}&rdquo;
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {total.toLocaleString()} products found
                  </p>
                </div>
                <SortSelector value={sortBy} onChange={setSortBy} />
              </div>
            )}

            {/* Sort selector for landing page */}
            {!currentQuery && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-neutral-400">
                  {total.toLocaleString()} products
                </p>
                <SortSelector value={sortBy} onChange={setSortBy} />
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {sortedProducts.map((product, idx) => (
                <ProductCard
                  key={`${product.code}-${idx}`}
                  product={product}
                  hasSubscription={hasSubscription}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-10">
                <button
                  onClick={() => handleSearch(activeQuery, page - 1, !currentQuery)}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm font-medium bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {t("previous")}
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleSearch(activeQuery, pageNum, !currentQuery)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === page
                            ? "bg-orange-500 text-white"
                            : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handleSearch(activeQuery, page + 1, !currentQuery)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm font-medium bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {t("next")}
                </button>
              </div>
            )}
          </>
        )}

        {/* No results */}
        {!isLoading && !error && products.length === 0 && currentQuery && (
          <div className="mt-20 text-center">
            <div className="text-neutral-200 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-neutral-400 text-base">{t("noResults")}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg"
              alt="Open Food Facts"
              className="h-5 opacity-40"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-xs text-neutral-400">
              &mdash; free and open food products database
            </span>
          </div>
          <p className="text-xs text-neutral-300">
            Data under ODbL license &middot; Images under CC BY-SA
          </p>
        </div>
      </footer>
    </div>
  );
}
