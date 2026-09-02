"use client";

import Link from "next/link";
import { chrome } from "@/words/ui";
import { closing, product } from "@/words/site";
import { LanguageSwitch } from "@/paper/frame/language-switch";
import { Mark } from "@/paper/frame/mark";
import { useLanguage } from "@/paper/parts/language";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { say } = useLanguage();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-stock">
        <div className="mx-auto flex max-w-[1080px] items-center gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="text-ink">
            <Mark />
          </Link>
          <div className="flex-1" />
          <LanguageSwitch />
          <Link
            href="/login"
            className="text-[13px] text-ink-3 transition-colors hover:text-ink"
          >
            {say(chrome.signIn)}
          </Link>
          <Link
            href="/ledger"
            className="border border-ink bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-stock transition-colors hover:bg-plum hover:border-plum"
          >
            {say(chrome.openBook)}
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-3 px-5 py-8 text-xs text-ink-3 lg:flex-row lg:items-center lg:px-8">
          <Mark className="text-ink" />
          <p className="max-w-[58ch] lg:ml-6">{say(closing)}</p>
          <span className="lg:ml-auto">
            © {new Date().getUTCFullYear()} {product.name}
          </span>
        </div>
      </footer>
    </div>
  );
}
