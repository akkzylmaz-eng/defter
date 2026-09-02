"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { auth } from "@/words/ui";
import { LanguageSwitch } from "@/paper/frame/language-switch";
import { Mark } from "@/paper/frame/mark";
import { Note, Sheet } from "@/paper/parts/marks";
import { useLanguage } from "@/paper/parts/language";

/** Both screens are the same sheet. Nothing is validated, and it says so. */
export function AuthSheet({ mode }: { mode: "login" | "signup" }) {
  const { say } = useLanguage();
  const router = useRouter();
  const isLogin = mode === "login";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/ledger");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-4 border-b border-rule px-5 py-4 lg:px-8">
        <Link href="/" className="text-ink">
          <Mark />
        </Link>
        <div className="flex-1" />
        <LanguageSwitch />
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-14">
        <Sheet className="w-full max-w-md p-7">
          <h1 className="font-serif text-3xl leading-none text-ink">
            {say(isLogin ? auth.loginTitle : auth.signupTitle)}
          </h1>
          <p className="mt-2 text-[13px] text-ink-2">{say(auth.lead)}</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {isLogin ? null : <Field label={say(auth.business)} name="business" />}
            <Field label={say(auth.email)} name="email" type="email" />
            <Field label={say(auth.password)} name="password" type="password" />
            <button
              type="submit"
              className="w-full border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-stock transition-colors hover:border-plum hover:bg-plum"
            >
              {say(isLogin ? auth.loginTitle : auth.signupTitle)}
            </button>
          </form>

          <div className="mt-5">
            <Note>{say(auth.demoNote)}</Note>
          </div>

          <p className="mt-5 text-[13px] text-ink-2">
            {say(isLogin ? auth.toSignup : auth.toLogin)}{" "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="font-semibold text-plum hover:underline"
            >
              {say(isLogin ? auth.signupTitle : auth.loginTitle)}
            </Link>
          </p>
        </Sheet>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="field">{label}</span>
      <input
        name={name}
        type={type}
        className="mt-1.5 w-full border border-rule-2 bg-stock px-3 py-2 text-[13px] text-ink focus:border-plum focus:outline-none"
      />
    </label>
  );
}
