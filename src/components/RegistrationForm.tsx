"use client";

import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { tickets, formatFCFA } from "@/lib/content";

export default function RegistrationForm({
  locale,
  onlinePaymentEnabled,
}: {
  locale: Locale;
  onlinePaymentEnabled: boolean;
}) {
  const dict = getDict(locale);
  const [ticketKey, setTicketKey] = useState(tickets[0].key);
  const [payment, setPayment] = useState<"fedapay" | "onsite">(
    onlinePaymentEnabled ? "fedapay" : "onsite"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = tickets.find((t) => t.key === ticketKey)!;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ticketType: ticketKey,
          paymentMethod: payment,
          locale,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.redirectUrl) throw new Error(json.error ?? "ERROR");
      window.location.href = json.redirectUrl;
    } catch {
      setError(dict.register.errorGeneric);
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-loyal-200 bg-white px-4 py-3 text-sm text-loyal-900 outline-none transition focus:border-loyal-500 focus:ring-2 focus:ring-loyal-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* ---------------------------------------------- 1. Billets */}
      <section>
        <h2 className="font-display text-xl font-extrabold text-loyal-800">
          {dict.register.step1}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tickets.map((ticket) => {
            const active = ticket.key === ticketKey;
            return (
              <button
                type="button"
                key={ticket.key}
                onClick={() => setTicketKey(ticket.key)}
                aria-pressed={active}
                className={`relative flex flex-col rounded-3xl border-2 p-5 text-left transition ${
                  active
                    ? "border-loyal-700 bg-loyal-700 text-white shadow-xl"
                    : "border-loyal-100 bg-white text-loyal-900 hover:border-loyal-300"
                }`}
              >
                {ticket.popular && (
                  <span className="absolute -top-3 left-4 rounded-full bg-gold-400 px-3 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-loyal-900">
                    {dict.register.popular}
                  </span>
                )}
                <span className="font-display text-sm font-bold">
                  {ticket.name[locale]}
                </span>
                <span
                  className={`mt-2 font-display text-2xl font-black ${
                    active ? "text-gold-300" : "text-maroon-600"
                  }`}
                >
                  {formatFCFA(ticket.price, locale)}
                </span>
                <ul
                  className={`mt-3 space-y-1.5 text-xs leading-snug ${
                    active ? "text-white/80" : "text-slate-600"
                  }`}
                >
                  {ticket.features[locale].map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className={active ? "text-gold-300" : "text-gold-500"}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <span
                  className={`mt-4 rounded-full px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wide ${
                    active
                      ? "bg-gold-400 text-loyal-900"
                      : "bg-loyal-50 text-loyal-700"
                  }`}
                >
                  {active ? dict.register.selectedTicket : dict.register.selectTicket}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------- 2. Coordonnées */}
      <section>
        <h2 className="font-display text-xl font-extrabold text-loyal-800">
          {dict.register.step2}
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
              {dict.register.firstName} *
            </span>
            <input name="firstName" required className={inputClass} autoComplete="given-name" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
              {dict.register.lastName} *
            </span>
            <input name="lastName" required className={inputClass} autoComplete="family-name" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
              {dict.register.email} *
            </span>
            <input name="email" type="email" required className={inputClass} autoComplete="email" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
              {dict.register.phone} *
            </span>
            <input
              name="phone"
              type="tel"
              required
              placeholder="+229 01 97 00 00 00"
              className={inputClass}
              autoComplete="tel"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
              {dict.register.memberType} *
            </span>
            <select name="memberType" required className={inputClass} defaultValue="member">
              <option value="member">{dict.register.member}</option>
              <option value="guest">{dict.register.guest}</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
              {dict.register.club}
            </span>
            <input
              name="club"
              placeholder={dict.register.clubPlaceholder}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
              {dict.register.city}
            </span>
            <input name="city" className={inputClass} autoComplete="address-level2" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
              {dict.register.country}
            </span>
            <input
              name="country"
              defaultValue={locale === "fr" ? "Bénin" : "Benin"}
              className={inputClass}
              autoComplete="country-name"
            />
          </label>
        </div>
      </section>

      {/* ---------------------------------------------- 3. Paiement */}
      <section>
        <h2 className="font-display text-xl font-extrabold text-loyal-800">
          {dict.register.step3}
        </h2>

        {!onlinePaymentEnabled && (
          <p className="mt-4 rounded-2xl border border-gold-400/60 bg-gold-300/15 px-5 py-3.5 text-sm font-medium text-loyal-800">
            ⚠️ {dict.register.onlineUnavailable}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={!onlinePaymentEnabled}
            onClick={() => setPayment("fedapay")}
            aria-pressed={payment === "fedapay"}
            className={`rounded-2xl border-2 p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
              payment === "fedapay"
                ? "border-loyal-700 bg-loyal-50"
                : "border-loyal-100 bg-white hover:border-loyal-300"
            }`}
          >
            <div className="font-display font-bold text-loyal-900">
              📱 {dict.register.payOnline}
            </div>
            <div className="mt-1 text-xs text-slate-500">{dict.register.payOnlineHint}</div>
          </button>
          <button
            type="button"
            onClick={() => setPayment("onsite")}
            aria-pressed={payment === "onsite"}
            className={`rounded-2xl border-2 p-5 text-left transition ${
              payment === "onsite"
                ? "border-loyal-700 bg-loyal-50"
                : "border-loyal-100 bg-white hover:border-loyal-300"
            }`}
          >
            <div className="font-display font-bold text-loyal-900">
              🏛️ {dict.register.payOnsite}
            </div>
            <div className="mt-1 text-xs text-slate-500">{dict.register.payOnsiteHint}</div>
          </button>
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-4 rounded-3xl border border-loyal-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-500">
              {dict.register.total} — {selected.name[locale]}
            </div>
            <div className="font-display text-3xl font-black text-loyal-800">
              {formatFCFA(selected.price, locale)}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-gold-400 px-10 py-4 font-display text-sm font-extrabold uppercase tracking-wide text-loyal-900 shadow-xl shadow-gold-500/25 transition hover:scale-[1.02] hover:bg-gold-300 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? dict.register.submitting : dict.register.submit}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl border border-maroon-400 bg-maroon-600/10 px-5 py-3.5 text-sm font-semibold text-maroon-600">
            {error}
          </p>
        )}
      </section>
    </form>
  );
}
