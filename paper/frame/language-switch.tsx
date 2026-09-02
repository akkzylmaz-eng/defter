"use client";

import { LANGUAGES, LANGUAGE_LABEL } from "@/kit/i18n";
import { cn } from "@/kit/cn";
import { useLanguage } from "@/paper/parts/language";

export function LanguageSwitch({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex items-center border border-rule", className)}>
      {LANGUAGES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          aria-pressed={language === option}
          className={cn(
            "px-2 py-1 text-[11px] font-semibold tracking-wide transition-colors",
            language === option ? "bg-ink text-stock" : "text-ink-3 hover:text-ink",
          )}
        >
          {LANGUAGE_LABEL[option]}
        </button>
      ))}
    </div>
  );
}
