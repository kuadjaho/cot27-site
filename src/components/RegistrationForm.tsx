"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import {
  tickets,
  ticketOptions,
  computeTunnelTotal,
  formatFCFA,
} from "@/lib/content";

// Tunnel d'inscription en 4 étapes (§6.1) : billet → identité → récapitulatif
// → paiement. Progression sauvegardée en localStorage + brouillon serveur
// (lien de reprise), total visible en permanence, montant recalculé serveur.

type Membre = { prenom: string; nom: string; email: string };

type TunnelState = {
  mode: "solo" | "delegation";
  ticketKey: string;
  options: string[];
  promoCode: string;
  promoPct: number;
  identity: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    club: string;
    country: string;
  };
  membres: Membre[];
  payment: "mtn" | "moov" | "carte" | "virement";
};

const STORAGE_KEY = "cot27-tunnel";
const emptyMembre = (): Membre => ({ prenom: "", nom: "", email: "" });

export default function RegistrationForm({
  locale,
  onlinePaymentEnabled,
}: {
  locale: Locale;
  onlinePaymentEnabled: boolean;
}) {
  const dict = getDict(locale);
  const t = dict.tunnel;

  const [step, setStep] = useState(0);
  const [state, setState] = useState<TunnelState>({
    mode: "solo",
    ticketKey: tickets[0].key,
    options: [],
    promoCode: "",
    promoPct: 0,
    identity: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      club: "",
      country: locale === "fr" ? "Bénin" : "Benin",
    },
    membres: [emptyMembre()],
    payment: onlinePaymentEnabled ? "mtn" : "virement",
  });
  const [cgv, setCgv] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [token, setToken] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  const patch = useCallback((partial: Partial<TunnelState>) => {
    setState((s) => ({ ...s, ...partial }));
  }, []);

  // ------------------------------------------------------------- reprise
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reprise = params.get("reprise");

    async function hydrate() {
      if (reprise) {
        try {
          const res = await fetch(`/api/tunnel/draft?token=${encodeURIComponent(reprise)}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data?.state) {
              setState((s) => ({ ...s, ...json.data.state }));
              setStep(Math.min(2, json.etape ?? 0));
              setToken(reprise);
              setResumed(true);
              hydrated.current = true;
              return;
            }
          }
        } catch {
          /* brouillon introuvable → tunnel vierge */
        }
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.state) {
            setState((s) => ({ ...s, ...saved.state }));
            if (saved.token) setToken(saved.token);
          }
        }
      } catch {
        /* localStorage indisponible */
      }
      hydrated.current = true;
    }

    hydrate();
  }, []);

  // ------------------------------------------------- sauvegarde continue
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, token }));
    } catch {
      /* stockage plein ou bloqué : non bloquant */
    }
  }, [state, token]);

  const saveDraft = useCallback(
    (etape: number) => {
      fetch("/api/tunnel/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, etape, data: { state } }),
      })
        .then((r) => r.json())
        .then((json) => json.token && setToken(json.token))
        .catch(() => {});
    },
    [state, token]
  );

  // ------------------------------------------------------------- dérivés
  const cleanMembres = state.membres.filter((m) => m.prenom || m.nom || m.email);
  const participants = state.mode === "delegation" ? 1 + cleanMembres.length : 1;
  const pricing = computeTunnelTotal({
    ticketKey: state.ticketKey,
    optionKeys: state.options,
    participants,
    promoPct: state.promoPct,
  });
  const ticket = tickets.find((tk) => tk.key === state.ticketKey)!;

  const stepValid = [
    true,
    Boolean(
      state.identity.firstName.trim() &&
        state.identity.lastName.trim() &&
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.identity.email) &&
        state.identity.phone.trim() &&
        (state.mode === "solo" || cleanMembres.length >= 1)
    ),
    cgv,
    true,
  ][step];

  function goTo(next: number) {
    setStep(next);
    saveDraft(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ------------------------------------------------------------ actions
  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setPromoState("checking");
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (json.valid) {
        patch({ promoCode: json.code, promoPct: json.pct });
        setPromoState("ok");
      } else {
        patch({ promoCode: "", promoPct: 0 });
        setPromoState("bad");
      }
    } catch {
      setPromoState("bad");
    }
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: state.mode,
          ticketType: state.ticketKey,
          options: state.options,
          promoCode: state.promoCode,
          membres: cleanMembres,
          firstName: state.identity.firstName,
          lastName: state.identity.lastName,
          email: state.identity.email,
          phone: state.identity.phone,
          club: state.identity.club,
          country: state.identity.country,
          memberType: state.identity.club ? "member" : "guest",
          paymentMethod: state.payment,
          locale,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.redirectUrl) throw new Error(json.error ?? "ERROR");
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = json.redirectUrl;
    } catch {
      setError(dict.register.errorGeneric);
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-loyal-200 bg-white px-4 py-3 text-sm text-loyal-900 outline-none transition focus:border-loyal-500 focus:ring-2 focus:ring-loyal-200";
  const resumeUrl =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/inscription?reprise=${token}`
      : null;

  return (
    <div className="space-y-8 pb-32">
      {/* ------------------------------------------------------ stepper */}
      <ol className="flex flex-wrap items-center gap-2 sm:gap-0">
        {t.steps.map((label, i) => (
          <li key={label} className="flex items-center">
            <button
              type="button"
              onClick={() => i < step && goTo(i)}
              disabled={i > step}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                i === step
                  ? "bg-loyal-700 text-white"
                  : i < step
                    ? "bg-loyal-50 text-loyal-700 hover:bg-loyal-100"
                    : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                  i === step
                    ? "bg-gold-400 text-loyal-900"
                    : i < step
                      ? "bg-loyal-700 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </button>
            {i < t.steps.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-loyal-200 sm:block" aria-hidden />
            )}
          </li>
        ))}
      </ol>

      {resumed && (
        <p className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800">
          ✓ {t.resumeLoaded}
        </p>
      )}

      {/* ------------------------------------------------ étape 0 : billet */}
      {step === 0 && (
        <section className="space-y-10">
          <div>
            <h2 className="font-display text-xl font-extrabold text-loyal-800">
              {t.modeTitle}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(
                [
                  { key: "solo", label: t.modeSolo, hint: t.modeSoloHint, icon: "👤" },
                  {
                    key: "delegation",
                    label: t.modeDelegation,
                    hint: t.modeDelegationHint,
                    icon: "👥",
                  },
                ] as const
              ).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => patch({ mode: m.key })}
                  aria-pressed={state.mode === m.key}
                  className={`rounded-2xl border-2 p-5 text-left transition ${
                    state.mode === m.key
                      ? "border-loyal-700 bg-loyal-50"
                      : "border-loyal-100 bg-white hover:border-loyal-300"
                  }`}
                >
                  <div className="font-display font-bold text-loyal-900">
                    {m.icon} {m.label}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-500">{m.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl font-extrabold text-loyal-800">
              {dict.register.step1.replace("1. ", "")}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tickets.map((tk) => {
                const active = tk.key === state.ticketKey;
                return (
                  <button
                    type="button"
                    key={tk.key}
                    onClick={() => patch({ ticketKey: tk.key })}
                    aria-pressed={active}
                    className={`relative flex flex-col rounded-3xl border-2 p-5 text-left transition ${
                      active
                        ? "border-loyal-700 bg-loyal-700 text-white shadow-xl"
                        : "border-loyal-100 bg-white text-loyal-900 hover:border-loyal-300"
                    }`}
                  >
                    {tk.popular && (
                      <span className="absolute -top-3 left-4 rounded-full bg-gold-400 px-3 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-loyal-900">
                        {dict.register.popular}
                      </span>
                    )}
                    <span className="font-display text-sm font-bold">{tk.name[locale]}</span>
                    <span
                      className={`mt-2 font-display text-2xl font-black ${
                        active ? "text-gold-300" : "text-maroon-600"
                      }`}
                    >
                      {formatFCFA(tk.price, locale)}
                    </span>
                    {state.mode === "delegation" && (
                      <span className={`text-xs ${active ? "text-white/70" : "text-slate-500"}`}>
                        {t.perPerson}
                      </span>
                    )}
                    <ul
                      className={`mt-3 space-y-1.5 text-xs leading-snug ${
                        active ? "text-white/80" : "text-slate-600"
                      }`}
                    >
                      {tk.features[locale].map((f) => (
                        <li key={f} className="flex gap-2">
                          <span className={active ? "text-gold-300" : "text-gold-500"}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>

          {state.mode === "solo" && (
            <div>
              <h2 className="font-display text-xl font-extrabold text-loyal-800">
                {t.optionsTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{t.optionsHint}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {ticketOptions.map((opt) => {
                  const active = state.options.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() =>
                        patch({
                          options: active
                            ? state.options.filter((k) => k !== opt.key)
                            : [...state.options, opt.key],
                        })
                      }
                      aria-pressed={active}
                      className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                        active
                          ? "border-loyal-700 bg-loyal-50"
                          : "border-loyal-100 bg-white hover:border-loyal-300"
                      }`}
                    >
                      <span className="text-sm font-semibold text-loyal-900">
                        {opt.name[locale]}
                      </span>
                      <span className="shrink-0 font-display text-sm font-extrabold text-maroon-600">
                        +{formatFCFA(opt.price, locale)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-display text-xl font-extrabold text-loyal-800">
              {t.promoTitle}
            </h2>
            <div className="mt-4 flex max-w-md gap-3">
              <input
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value.toUpperCase());
                  setPromoState("idle");
                }}
                placeholder={t.promoPlaceholder}
                className={inputClass}
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoState === "checking"}
                className="shrink-0 rounded-xl border border-loyal-200 px-5 text-sm font-bold text-loyal-700 transition hover:border-loyal-700 disabled:opacity-50"
              >
                {t.promoApply}
              </button>
            </div>
            {promoState === "ok" && (
              <p className="mt-2 text-sm font-semibold text-emerald-700">
                ✓ {t.promoApplied} : −{state.promoPct} %
              </p>
            )}
            {promoState === "bad" && (
              <p className="mt-2 text-sm font-semibold text-maroon-600">{t.promoInvalid}</p>
            )}
          </div>
        </section>
      )}

      {/* --------------------------------------------- étape 1 : identité */}
      {step === 1 && (
        <section className="space-y-10">
          <div>
            <h2 className="font-display text-xl font-extrabold text-loyal-800">
              {state.mode === "delegation"
                ? t.responsableTitle
                : dict.register.step2.replace("2. ", "")}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {(
                [
                  { key: "firstName", label: dict.register.firstName, req: true, auto: "given-name" },
                  { key: "lastName", label: dict.register.lastName, req: true, auto: "family-name" },
                  { key: "email", label: dict.register.email, req: true, auto: "email", type: "email" },
                  { key: "phone", label: dict.register.phone, req: true, auto: "tel", type: "tel", placeholder: "+229 01 97 00 00 00" },
                  { key: "club", label: dict.register.club, req: false, placeholder: dict.register.clubPlaceholder },
                  { key: "country", label: dict.register.country, req: false, auto: "country-name" },
                ] as const
              ).map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
                    {f.label} {f.req && "*"}
                  </span>
                  <input
                    type={"type" in f ? f.type : "text"}
                    required={f.req}
                    value={state.identity[f.key]}
                    onChange={(e) =>
                      patch({ identity: { ...state.identity, [f.key]: e.target.value } })
                    }
                    placeholder={"placeholder" in f ? f.placeholder : undefined}
                    autoComplete={"auto" in f ? f.auto : undefined}
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
          </div>

          {state.mode === "delegation" && (
            <div>
              <h2 className="font-display text-xl font-extrabold text-loyal-800">
                {t.delegationMembers}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                {t.delegationMembersHint}
              </p>
              <div className="mt-5 space-y-3">
                {state.membres.map((m, i) => (
                  <div
                    key={i}
                    className="grid gap-3 rounded-2xl border border-loyal-100 bg-white p-4 sm:grid-cols-[1fr_1fr_1.4fr_auto]"
                  >
                    <input
                      value={m.prenom}
                      onChange={(e) => {
                        const membres = [...state.membres];
                        membres[i] = { ...m, prenom: e.target.value };
                        patch({ membres });
                      }}
                      placeholder={`${dict.register.firstName} — ${t.memberN} ${i + 2}`}
                      className={inputClass}
                    />
                    <input
                      value={m.nom}
                      onChange={(e) => {
                        const membres = [...state.membres];
                        membres[i] = { ...m, nom: e.target.value };
                        patch({ membres });
                      }}
                      placeholder={dict.register.lastName}
                      className={inputClass}
                    />
                    <input
                      type="email"
                      value={m.email}
                      onChange={(e) => {
                        const membres = [...state.membres];
                        membres[i] = { ...m, email: e.target.value };
                        patch({ membres });
                      }}
                      placeholder={dict.register.email}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch({ membres: state.membres.filter((_, j) => j !== i) })
                      }
                      className="self-center rounded-xl px-3 py-2 text-xs font-bold text-maroon-600 transition hover:bg-maroon-600/10"
                      aria-label={t.removeMember}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {state.membres.length < 49 && (
                <button
                  type="button"
                  onClick={() => patch({ membres: [...state.membres, emptyMembre()] })}
                  className="mt-4 rounded-full border border-loyal-200 px-6 py-2.5 text-sm font-bold text-loyal-700 transition hover:border-loyal-700"
                >
                  {t.addMember}
                </button>
              )}
            </div>
          )}

          {resumeUrl && (
            <div className="rounded-2xl border border-loyal-100 bg-loyal-50/60 px-5 py-4">
              <p className="text-sm font-semibold text-loyal-800">{t.resumeText}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <code className="max-w-full overflow-x-auto rounded-lg bg-white px-3 py-1.5 text-xs text-loyal-700">
                  {resumeUrl}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(resumeUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="rounded-full bg-loyal-700 px-4 py-1.5 text-xs font-bold text-white"
                >
                  {copied ? `✓ ${t.resumeCopied}` : t.resumeCopy}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ----------------------------------------- étape 2 : récapitulatif */}
      {step === 2 && (
        <section className="space-y-8">
          <div className="rounded-3xl border border-loyal-100 bg-white p-8 shadow-sm">
            <dl className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-slate-500">
                  {t.recapBillet} — {ticket.name[locale]}
                  {participants > 1 && ` × ${participants} ${t.recapParticipants}`}
                </dt>
                <dd className="font-semibold text-loyal-800">
                  {formatFCFA(pricing.base, locale)}
                </dd>
              </div>
              {pricing.delegationRebate > 0 && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-slate-500">
                    {t.delegationRebate} (−{pricing.delegationPct} %)
                  </dt>
                  <dd className="font-semibold text-emerald-700">
                    −{formatFCFA(pricing.delegationRebate, locale)}
                  </dd>
                </div>
              )}
              {state.options.map((key) => {
                const opt = ticketOptions.find((o) => o.key === key);
                return opt ? (
                  <div key={key} className="flex items-baseline justify-between gap-4">
                    <dt className="text-slate-500">
                      {t.recapOptions} — {opt.name[locale]}
                    </dt>
                    <dd className="font-semibold text-loyal-800">
                      +{formatFCFA(opt.price, locale)}
                    </dd>
                  </div>
                ) : null;
              })}
              {pricing.promoRebate > 0 && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-slate-500">
                    {t.recapPromo} {state.promoCode} (−{state.promoPct} %)
                  </dt>
                  <dd className="font-semibold text-emerald-700">
                    −{formatFCFA(pricing.promoRebate, locale)}
                  </dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-4 border-t border-loyal-100 pt-4">
                <dt className="font-display text-base font-extrabold text-loyal-800">
                  {t.totalLabel}
                </dt>
                <dd className="font-display text-2xl font-black text-maroon-600">
                  {formatFCFA(pricing.total, locale)}
                </dd>
              </div>
            </dl>
          </div>

          <p className="rounded-2xl border border-loyal-100 bg-loyal-50/60 px-5 py-4 text-sm leading-relaxed text-loyal-800">
            {t.cancelPolicy}
          </p>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={cgv}
              onChange={(e) => setCgv(e.target.checked)}
              className="mt-1 h-5 w-5 accent-loyal-700"
            />
            <span className="text-sm font-semibold text-loyal-800">{t.cgv} *</span>
          </label>
        </section>
      )}

      {/* --------------------------------------------- étape 3 : paiement */}
      {step === 3 && (
        <section className="space-y-6">
          <h2 className="font-display text-xl font-extrabold text-loyal-800">{t.payTitle}</h2>

          {!onlinePaymentEnabled && (
            <p className="rounded-2xl border border-gold-400/60 bg-gold-300/15 px-5 py-3.5 text-sm font-medium text-loyal-800">
              ⚠️ {dict.register.onlineUnavailable}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                { key: "mtn", label: t.payMtn, icon: "📱", hint: t.payFedapayHint, online: true },
                { key: "moov", label: t.payMoov, icon: "📲", hint: t.payFedapayHint, online: true },
                { key: "carte", label: t.payCard, icon: "💳", hint: t.payFedapayHint, online: true },
                { key: "virement", label: t.payWire, icon: "🏦", hint: t.payWireHint, online: false },
              ] as const
            ).map((m) => {
              const disabled = m.online && !onlinePaymentEnabled;
              return (
                <button
                  key={m.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => patch({ payment: m.key })}
                  aria-pressed={state.payment === m.key}
                  className={`rounded-2xl border-2 p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    state.payment === m.key
                      ? "border-loyal-700 bg-loyal-50"
                      : "border-loyal-100 bg-white hover:border-loyal-300"
                  }`}
                >
                  <div className="font-display font-bold text-loyal-900">
                    {m.icon} {m.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{m.hint}</div>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="rounded-2xl border border-maroon-400 bg-maroon-600/10 px-5 py-3.5 text-sm font-semibold text-maroon-600">
              {error}
            </p>
          )}
        </section>
      )}

      {/* --------------------------------------------- barre totale fixe */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-loyal-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="rounded-full border border-loyal-200 px-5 py-2.5 text-sm font-bold text-loyal-700 transition hover:border-loyal-700"
              >
                ← {t.back}
              </button>
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.totalLabel}
                {participants > 1 && ` · ${participants} ${t.participantsLabel}`}
              </div>
              <div className="font-display text-xl font-black text-loyal-800">
                {formatFCFA(pricing.total, locale)}
              </div>
            </div>
          </div>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              disabled={!stepValid}
              className="rounded-full bg-loyal-700 px-8 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-loyal-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.next} →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-full bg-gold-400 px-8 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-loyal-900 shadow-xl shadow-gold-500/25 transition hover:scale-[1.02] hover:bg-gold-300 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting
                ? dict.register.submitting
                : state.payment === "virement"
                  ? t.finalize
                  : `${t.payNow} ${formatFCFA(pricing.total, locale)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
