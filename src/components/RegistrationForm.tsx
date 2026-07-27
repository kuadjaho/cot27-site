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
  /** Cible du défilement entre étapes — le formulaire, pas le document. */
  const topRef = useRef<HTMLDivElement>(null);
  /**
   * Les erreurs ne s'affichent qu'après une tentative d'avancer : on
   * n'accueille pas quelqu'un par un formulaire déjà rouge, mais on lui dit
   * précisément ce qui bloque dès qu'il essaie de continuer.
   */
  const [tenteAvancer, setTenteAvancer] = useState(false);

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
            setState((s) => {
              const restored = { ...s, ...saved.state };
              // Un brouillon peut dater d'avant le retrait d'un tarif — la
              // préinscription, typiquement, disparaît une fois sa date passée.
              // Sans cette garde, le billet restauré n'existe plus dans le
              // catalogue et le récapitulatif plante sur un écran blanc, sans
              // recours possible pour le participant.
              if (!tickets.some((tk) => tk.key === restored.ticketKey)) {
                restored.ticketKey = tickets[0].key;
              }
              // Même raisonnement pour les options retirées du catalogue.
              restored.options = (restored.options ?? []).filter((k: string) =>
                ticketOptions.some((o) => o.key === k)
              );
              return restored;
            });
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
  // Pas d'assertion non-nulle ici : la garde d'hydratation ci-dessus ramène
  // déjà tout billet inconnu vers le catalogue, et ce repli évite qu'une
  // divergence future se traduise par un écran blanc au moment de payer.
  const ticket =
    tickets.find((tk) => tk.key === state.ticketKey) ?? tickets[0];

  /**
   * Erreur par champ, en clair. Le tunnel n'affichait rien : le bouton
   * « Continuer » devenait simplement inerte, ce qui ne dit ni ce qui manque
   * ni où. Les libellés existaient déjà, traduits, mais n'étaient appelés
   * nulle part.
   */
  const erreurs: Record<string, string> = {};
  if (!state.identity.firstName.trim()) erreurs.firstName = dict.register.required;
  if (!state.identity.lastName.trim()) erreurs.lastName = dict.register.required;
  if (!state.identity.email.trim()) erreurs.email = dict.register.required;
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.identity.email))
    erreurs.email = dict.register.invalidEmail;
  if (!state.identity.phone.trim()) erreurs.phone = dict.register.required;
  if (state.mode === "delegation" && cleanMembres.length < 1)
    erreurs.membres = t.delegationAtLeastOne;

  const stepValid = [
    true,
    Object.keys(erreurs).length === 0,
    cgv,
    true,
  ][step];

  /**
   * Tentative d'avancer. Si l'étape est incomplète, on ne reste plus muet :
   * on révèle les erreurs et on amène la personne au premier champ fautif.
   */
  function essayerAvancer(next: number) {
    if (!stepValid) {
      setTenteAvancer(true);
      requestAnimationFrame(() => {
        const cible = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        cible?.scrollIntoView({ behavior: "smooth", block: "center" });
        cible?.focus();
      });
      return;
    }
    setTenteAvancer(false);
    goTo(next);
  }

  function goTo(next: number) {
    setStep(next);
    saveDraft(next);
    // On remonte au FORMULAIRE, pas en haut du document. Sur un écran de
    // 360 × 640, le haut du document place le bandeau de page et le fil des
    // étapes dans la fenêtre : aucun champ n'était visible après un changement
    // d'étape, ce qui se lit comme un retour en arrière.
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    // pb-40 : la barre de total est fixe et plus haute que l'ancien pb-32 sur
    // petit écran — le dernier champ passait dessous. scroll-mt-20 dégage le
    // header collant quand goTo() ramène ici.
    <div ref={topRef} className="scroll-mt-20 space-y-8 pb-40">
      {/* ------------------------------------------------------ stepper */}
      <ol className="flex flex-wrap items-center gap-2 sm:gap-0">
        {t.steps.map((label, i) => (
          <li key={label} className="flex items-center">
            <button
              type="button"
              onClick={() => i < step && goTo(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
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
              <span className="mx-1 max-sm:hidden h-px w-6 bg-loyal-200 sm:block" aria-hidden />
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
                  // Bascule en délégation → on PURGE les options. Sans cela,
                  // une option cochée en individuel restait dans l'état alors
                  // que son bloc disparaissait de l'écran : elle s'affichait au
                  // récapitulatif, gonflait la barre de total, mais n'était ni
                  // facturée par le serveur ni livrée — et plus rien ne
                  // permettait de la décocher.
                  onClick={() =>
                    patch({
                      mode: m.key,
                      options: m.key === "delegation" ? [] : state.options,
                    })
                  }
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
            {/* Le bloc Options disparaît en délégation. Sans cette phrase, sa
                disparition est silencieuse et le responsable croit avoir perdu
                une possibilité. */}
            {state.mode === "delegation" && (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {t.optionsDelegationNote}
              </p>
            )}
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
            <p className="mt-1 text-xs text-slate-500">{t.requiredLegend}</p>
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
              ).map((f) => {
                const erreur = tenteAvancer ? erreurs[f.key] : undefined;
                return (
                  <label key={f.key} className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
                      {f.label} {f.req && <span aria-hidden>*</span>}
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
                      aria-invalid={erreur ? true : undefined}
                      aria-describedby={erreur ? `err-${f.key}` : undefined}
                      className={`${inputClass} ${erreur ? "border-maroon-600" : ""}`}
                    />
                    {erreur && (
                      <p
                        id={`err-${f.key}`}
                        role="alert"
                        className="mt-2 text-sm font-semibold text-maroon-600"
                      >
                        {erreur}
                      </p>
                    )}
                  </label>
                );
              })}
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
              {tenteAvancer && erreurs.membres && (
                <p
                  role="alert"
                  className="mt-3 rounded-2xl border border-maroon-400 bg-maroon-600/10 px-4 py-3 text-sm font-semibold text-maroon-600"
                >
                  {erreurs.membres}
                </p>
              )}
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
              {/* Seconde barrière : le récapitulatif ne peut afficher une
                  option qu'en individuel. Les options ne sont facturées que
                  dans ce mode ; une ligne visible mais non facturée fausse la
                  lecture du total. */}
              {state.mode === "solo" &&
                state.options.map((key) => {
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

          {/* La case d'acceptation passe AVANT la politique d'annulation :
              c'est le seul verrou de l'étape, et il tombait plus de 400 px
              sous la ligne de flottaison — on cherchait sans savoir quoi. */}
          <div
            className={`rounded-2xl border px-5 py-4 transition ${
              tenteAvancer && !cgv
                ? "border-maroon-400 bg-maroon-600/10"
                : "border-loyal-100 bg-white"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={cgv}
                onChange={(e) => {
                  setCgv(e.target.checked);
                  if (e.target.checked) setTenteAvancer(false);
                }}
                aria-invalid={tenteAvancer && !cgv ? true : undefined}
                aria-describedby={tenteAvancer && !cgv ? "erreur-cgv" : undefined}
                // shrink-0 : sans lui la case était écrasée à 13 × 20 px par le
                // texte voisin, et ne se lisait plus comme une case à cocher.
                className="mt-0.5 h-5 w-5 shrink-0 accent-loyal-700"
              />
              <span className="text-sm font-semibold text-loyal-800">
                {t.cgv} <span aria-hidden>*</span>
              </span>
            </label>
            {tenteAvancer && !cgv && (
              <p
                id="erreur-cgv"
                role="alert"
                className="mt-2 pl-8 text-sm font-semibold text-maroon-600"
              >
                {t.cgvRequired}
              </p>
            )}
          </div>

          <p className="rounded-2xl border border-loyal-100 bg-loyal-50/60 px-5 py-4 text-sm leading-relaxed text-loyal-800">
            {t.cancelPolicy}
          </p>
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

          {/* Réassurance Mobile Money : n'apparaît que pour un paiement en ligne,
              juste avant la redirection vers FedaPay. Elle lève le principal
              point de décrochage — l'inconnu de « que se passe-t-il après le
              clic ? ». Les étapes 2 et 3 s'adaptent au canal (Mobile Money vs
              carte) pour rester exactes. */}
          {state.payment !== "virement" && onlinePaymentEnabled && (
            <div className="rounded-2xl border border-loyal-100 bg-loyal-50/60 p-5">
              <div className="flex items-center gap-2 font-display font-bold text-loyal-800">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                {t.reassureTitle}
              </div>
              <ol className="mt-4 space-y-3">
                {[
                  t.reassureStep1,
                  state.payment === "carte" ? t.reassureCard2 : t.reassureMomo2,
                  state.payment === "carte" ? t.reassureCard3 : t.reassureMomo3,
                  t.reassureStep4,
                ].map((label, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold ${
                        i === 3
                          ? "bg-lagune/15 text-lagune"
                          : "bg-loyal-700/10 text-loyal-700"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-loyal-800">{label}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-center gap-1.5 border-t border-loyal-100 pt-3 text-xs text-slate-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {t.reassureFoot}
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-2xl border border-maroon-400 bg-maroon-600/10 px-5 py-3.5 text-sm font-semibold text-maroon-600">
              {error}
            </p>
          )}
        </section>
      )}

      {/* --------------------------------------------- barre totale fixe */}
      {/* Barre de total : UNE seule rangée. Avec flex-wrap elle passait sur
          deux lignes sur petit écran et confisquait 21 % de la hauteur.
          env(safe-area-inset-bottom) tient compte de la barre de gestes
          Android, sous laquelle le bouton se retrouvait sinon. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-loyal-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                aria-label={t.back}
                // Sous 640 px, une flèche seule de 44 × 44 px : le libellé
                // poussait la barre sur une seconde rangée.
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-loyal-200 text-sm font-bold text-loyal-700 transition hover:border-loyal-700 sm:h-auto sm:w-auto sm:px-5 sm:py-2.5"
              >
                <span aria-hidden>←</span>
                <span className="ml-1 hidden sm:inline">{t.back}</span>
              </button>
            )}
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold uppercase tracking-wide text-loyal-700">
                {t.totalLabel}
                {participants > 1 && ` · ${participants} ${t.participantsLabel}`}
              </div>
              <div className="font-display text-xl font-black tabular-nums text-loyal-800">
                {formatFCFA(pricing.total, locale)}
              </div>
            </div>
          </div>

          {step < 3 ? (
            // Jamais `disabled` : un bouton inerte n'explique rien, et sur
            // tactile il n'y a même pas de curseur pour signaler le blocage.
            // Il reste cliquable et RÉVÈLE ce qui manque.
            <button
              type="button"
              onClick={() => essayerAvancer(step + 1)}
              aria-describedby={
                tenteAvancer && !stepValid ? "erreur-etape" : undefined
              }
              className={`shrink-0 rounded-full px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-white transition sm:px-8 ${
                stepValid
                  ? "bg-loyal-700 hover:bg-loyal-600"
                  : "bg-loyal-700/50 hover:bg-loyal-700/70"
              }`}
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
