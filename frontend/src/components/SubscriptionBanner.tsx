"use client";

import { useI18n } from "@/i18n/context";

interface SubscriptionBannerProps {
  status: string;
  onSubscribe: () => void;
}

export default function SubscriptionBanner({
  status,
  onSubscribe,
}: SubscriptionBannerProps) {
  const { t } = useI18n();
  const isActive = status === "active";

  if (isActive) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-emerald-700 flex items-center gap-1">
        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="hidden sm:inline">{t("subscriptionActive")}</span>
        <span className="sm:hidden">Pro</span>
      </div>
    );
  }

  return (
    <button
      onClick={onSubscribe}
      className="bg-orange-500 text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-orange-600 active:bg-orange-700 transition-colors"
    >
      {t("subscribe")}
    </button>
  );
}
