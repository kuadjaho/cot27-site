"use client";

import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";

/** Capture d'e-mails du teaser (S2) — liste d'attente avant l'Early Bird. */
export default function NewsletterSignup({
  locale,
  source,
}: {
  locale: Locale;
  source: string;
}) {
  const dict = getDict(locale);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, source }),
      });
      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="rounded-[2.5rem] border border-loyal-100 bg-white px-6 py-12 text-center shadow-sm sm:px-16">
        <h2 className="font-display text-2xl font-extrabold text-loyal-800 text-balance sm:text-3xl">
          {dict.newsletter.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{dict.newsletter.text}</p>

        {state === "success" ? (
          <p className="mx-auto mt-8 max-w-md rounded-full bg-emerald-50 px-6 py-3.5 text-sm font-bold text-emerald-800">
            ✓ {dict.newsletter.success}
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.newsletter.placeholder}
              className="flex-1 rounded-full border border-loyal-200 bg-white px-6 py-3.5 text-sm text-loyal-900 outline-none transition focus:border-loyal-500 focus:ring-2 focus:ring-loyal-200"
              aria-label={dict.newsletter.placeholder}
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="rounded-full bg-loyal-700 px-8 py-3.5 font-display text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-loyal-600 disabled:cursor-wait disabled:opacity-60"
            >
              {state === "sending" ? dict.newsletter.sending : dict.newsletter.button}
            </button>
          </form>
        )}
        {state === "error" && (
          <p className="mt-4 text-sm font-semibold text-maroon-600">
            {dict.newsletter.error}
          </p>
        )}
      </div>
    </section>
  );
}
