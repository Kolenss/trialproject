"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/context";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  hasSubscription: boolean;
  onSubscribe: () => void;
}

function fmt(value: number | null): string {
  if (value === null) return "—";
  return value.toFixed(1);
}

function getPercentDV(key: string, value: number | null): number | null {
  if (value === null) return null;
  const dvMap: Record<string, number> = {
    energyKcal: 2000, fat: 65, saturatedFat: 20, carbohydrates: 300,
    sugars: 50, fiber: 25, proteins: 50, salt: 6,
  };
  const dv = dvMap[key];
  if (!dv) return null;
  return Math.round((value / dv) * 100);
}

const summaryKeys = ["energyKcal", "fat", "proteins", "salt"] as const;

const summaryConfig: Record<string, { color: string; short: string }> = {
  energyKcal: { color: "bg-orange-500", short: "Cal" },
  fat:        { color: "bg-amber-500",  short: "Fat" },
  proteins:   { color: "bg-emerald-600", short: "Prot" },
  salt:       { color: "bg-rose-500",   short: "Salt" },
};

const allNutrientKeys = [
  "energyKcal", "fat", "saturatedFat", "carbohydrates",
  "sugars", "proteins", "fiber", "salt",
] as const;

function getCompleteness(nutrients: Product["nutrients"]): { available: number; total: number; percent: number } {
  const total = allNutrientKeys.length;
  if (!nutrients) return { available: 0, total, percent: 0 };
  const available = allNutrientKeys.filter(
    (k) => (nutrients as Record<string, unknown>)[k] !== null && (nutrients as Record<string, unknown>)[k] !== undefined
  ).length;
  return { available, total, percent: Math.round((available / total) * 100) };
}

export default function ProductCard({
  product,
  hasSubscription,
  onSubscribe,
}: ProductCardProps) {
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [showModal]);

  const labelFor = (key: string) => {
    const map: Record<string, string> = {
      energyKcal: t("energy"), fat: t("fat"), saturatedFat: t("saturatedFat"),
      carbohydrates: t("carbohydrates"), sugars: t("sugars"),
      proteins: t("proteins"), fiber: t("fiber"), salt: t("salt"),
    };
    return map[key] ?? key;
  };

  const unitFor = (key: string) => key === "energyKcal" ? t("kcal") : t("grams");

  const getNutrient = (key: string) =>
    product.nutrients?.[key as keyof NonNullable<Product["nutrients"]>] as number | null ?? null;

  return (
    <>
      <div className="group bg-white rounded-xl border border-neutral-200/60 overflow-hidden hover:shadow-lg hover:border-neutral-300/60 transition-all duration-200 flex flex-col">
        {/* Image — fixed aspect for alignment */}
        <div className="aspect-square bg-neutral-50 flex items-center justify-center p-5 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-neutral-200">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col gap-1.5">
          <h3 className="font-semibold text-[13px] text-neutral-900 leading-snug line-clamp-2 min-h-[2.25rem]">
            {product.name || t("unknownProduct")}
          </h3>
          <p className="text-[11px] text-neutral-400 leading-tight line-clamp-1">
            {product.brand || t("unknownBrand")}
          </p>

          <div className="mt-auto pt-2">
            {product.nutrients && hasSubscription ? (
              (() => {
                const { available, total, percent } = getCompleteness(product.nutrients);
                const hasSummaryData = summaryKeys.some((k) => getNutrient(k) !== null);
                return (
                  <>
                    {hasSummaryData ? (
                      <div className="grid grid-cols-2 gap-1">
                        {summaryKeys.map((key) => {
                          const raw = getNutrient(key);
                          const pct = getPercentDV(key, raw);
                          if (raw === null) return null;
                          const cfg = summaryConfig[key];
                          return (
                            <div
                              key={key}
                              className={`${cfg.color} rounded-md px-2 py-1 text-white flex items-baseline justify-between gap-1`}
                            >
                              <span className="text-[9px] font-medium opacity-80">{cfg.short}</span>
                              <span className="whitespace-nowrap tabular-nums text-[11px] font-bold">
                                {pct !== null ? `${pct}%` : fmt(raw)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-[11px] text-amber-700 font-medium">Nutrition data not yet reported</span>
                      </div>
                    )}

                    {available < total && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${percent >= 75 ? "bg-emerald-400" : percent >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-neutral-400 tabular-nums">{available}/{total}</span>
                      </div>
                    )}

                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-2 w-full text-[11px] text-neutral-500 hover:text-orange-600 font-medium text-center py-1 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      Nutrition Facts
                    </button>
                  </>
                );
              })()
            ) : (
              <button
                onClick={onSubscribe}
                className="w-full flex items-center justify-center gap-1.5 bg-neutral-50 hover:bg-orange-50 border border-neutral-200 hover:border-orange-200 rounded-lg py-2 text-[11px] font-medium text-neutral-500 hover:text-orange-700 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {t("subscriptionRequired")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nutrition Facts Modal */}
      {showModal && product.nutrients && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-[fadeIn_150ms_ease-out] max-h-[90vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-neutral-900 text-white px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold leading-tight">{t("nutritionalValues")}</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">Per 100 g</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-neutral-500 hover:text-white transition-colors p-0.5 -mr-1 -mt-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Product info */}
            <div className="px-5 py-3 border-b border-neutral-100">
              <p className="text-sm font-semibold text-neutral-900 line-clamp-1">{product.name}</p>
              {product.brand && (
                <p className="text-xs text-neutral-400 mt-0.5">{product.brand}</p>
              )}
            </div>

            {/* Nutrient rows — scrollable */}
            <div className="overflow-y-auto flex-1">
            {(() => {
              const { available, total, percent } = getCompleteness(product.nutrients);
              const hasIncomplete = available < total;
              return (
                <>
                  {hasIncomplete && (
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-100">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-amber-700">Data completeness</span>
                          <span className="text-[11px] font-bold text-amber-700 tabular-nums">{percent}%</span>
                        </div>
                        <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${percent >= 75 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="divide-y divide-neutral-100">
                    {allNutrientKeys.map((key) => {
                      const raw = getNutrient(key);
                      const pct = getPercentDV(key, raw);
                      const isIndented = key === "saturatedFat" || key === "sugars";
                      const isBold = !isIndented;

                      return (
                        <div
                          key={key}
                          className={`flex items-baseline justify-between px-5 py-2.5 gap-4 ${raw === null ? "bg-neutral-50/50" : ""}`}
                        >
                          <span className={`text-sm ${isIndented ? "pl-4 text-neutral-400" : "text-neutral-700"} ${isBold ? "font-semibold" : ""}`}>
                            {labelFor(key)}
                          </span>
                          <span className="flex items-baseline gap-2 whitespace-nowrap tabular-nums">
                            <span className={`text-sm ${isBold ? "font-semibold text-neutral-900" : "text-neutral-600"}`}>
                              {raw !== null ? (
                                <>{fmt(raw)}<span className="ml-0.5 text-neutral-400 font-normal text-xs">{unitFor(key)}</span></>
                              ) : (
                                <span className="text-neutral-300 font-normal italic text-xs">Not reported</span>
                              )}
                            </span>
                            {pct !== null && (
                              <span className="text-xs text-neutral-400 font-medium w-8 text-right">{pct}%</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </>
              );
            })()}
            </div>

            {/* Footer — pinned at bottom */}
            {(() => {
              const { available, total } = getCompleteness(product.nutrients);
              const hasIncomplete = available < total;
              return (
                <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 space-y-1 shrink-0">
                  <p className="text-[10px] text-neutral-400 text-center">
                    % Daily Value based on a 2,000 calorie diet
                  </p>
                  {hasIncomplete && (
                    <p className="text-[10px] text-amber-500 text-center">
                      Some data is missing — Open Food Facts is community-contributed and may be incomplete.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
