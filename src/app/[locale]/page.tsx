import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { schedule, speakers, sponsors } from "@/lib/content";
import Countdown from "@/components/Countdown";
import SpeakerCard from "@/components/SpeakerCard";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  const stats = [
    { value: "450", label: dict.stats.participants },
    { value: "12", label: dict.stats.clubs },
    { value: "15", label: dict.stats.speakers },
    { value: "20+", label: dict.stats.workshops },
  ];

  return (
    <>
      {/* ------------------------------------------------ HERO */}
      <section className="bg-hero relative overflow-hidden text-white">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">
              {dict.hero.kicker}
            </p>
            <h1 className="animate-rise-delay-1 mt-6 font-display text-4xl font-black leading-tight text-balance sm:text-6xl">
              « {dict.hero.theme} »
            </h1>
            <p className="animate-rise-delay-1 mt-4 font-display text-base font-semibold text-gold-300 sm:text-lg">
              {dict.hero.dates}
            </p>
            <p className="animate-rise-delay-2 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              {dict.hero.subtitle}
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/${locale}/inscription`}
                className="rounded-full bg-gold-400 px-8 py-3.5 font-display text-sm font-extrabold uppercase tracking-wide text-loyal-900 shadow-xl shadow-gold-500/25 transition hover:scale-[1.03] hover:bg-gold-300"
              >
                {dict.hero.cta}
              </Link>
              <Link
                href={`/${locale}/programme`}
                className="rounded-full border border-white/30 px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-white transition hover:border-gold-300 hover:text-gold-300"
              >
                {dict.hero.ctaSecondary}
              </Link>
            </div>
            <div className="animate-rise-delay-3 mt-14">
              <Countdown locale={locale} />
            </div>
          </div>
        </div>
        {/* vague décorative */}
        <svg
          className="absolute -bottom-px left-0 w-full text-[#fdfcf9]"
          viewBox="0 0 1440 60"
          fill="currentColor"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,32 C360,72 1080,-8 1440,32 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* ------------------------------------------------ STATS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-2 grid grid-cols-2 gap-4 py-12 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-loyal-100 bg-white p-6 text-center shadow-sm"
            >
              <div className="font-display text-4xl font-black text-loyal-700">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ ABOUT */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="section-kicker">{dict.about.kicker}</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800 text-balance sm:text-4xl">
              {dict.about.title}
            </h2>
            <p className="mt-5 leading-relaxed text-slate-600">{dict.about.p1}</p>
            <p className="mt-4 leading-relaxed text-slate-600">{dict.about.p2}</p>
          </div>
          <div className="space-y-4">
            {dict.about.highlights.map((h, i) => (
              <div
                key={h.title}
                className="flex gap-5 rounded-3xl border border-loyal-100 bg-white p-6 shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-loyal-700 font-display text-lg font-extrabold text-gold-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display font-bold text-loyal-800">{h.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ PROGRAMME PREVIEW */}
      <section className="bg-loyal-800 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker !text-gold-300">{dict.programPreview.kicker}</p>
              <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
                {dict.programPreview.title}
              </h2>
            </div>
            <Link
              href={`/${locale}/programme`}
              className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-bold transition hover:border-gold-300 hover:text-gold-300"
            >
              {dict.programPreview.seeAll} →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {schedule.map((day, i) => (
              <div
                key={day.date.fr}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="font-display text-sm font-bold uppercase tracking-wider text-gold-300">
                  {dict.program.day} {i + 1}
                </div>
                <div className="mt-1 font-display text-xl font-extrabold">
                  {day.label[locale]}
                </div>
                <div className="mt-1 text-sm text-white/60">{day.date[locale]}</div>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {day.items.slice(0, 4).map((item) => (
                    <li key={item.time + item.title.fr} className="flex gap-3">
                      <span className="font-mono text-xs text-gold-300/80 tabular-nums">
                        {item.time}
                      </span>
                      <span>{item.title[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ SPEAKERS PREVIEW */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">{dict.speakersPreview.kicker}</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800 sm:text-4xl">
              {dict.speakersPreview.title}
            </h2>
          </div>
          <Link
            href={`/${locale}/intervenants`}
            className="rounded-full border border-loyal-200 px-6 py-2.5 text-sm font-bold text-loyal-700 transition hover:border-loyal-700"
          >
            {dict.speakersPreview.seeAll} →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {speakers.slice(0, 3).map((speaker) => (
            <SpeakerCard key={speaker.name} speaker={speaker} locale={locale} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ SPONSORS */}
      <section className="border-y border-loyal-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="section-kicker justify-center">{dict.sponsors.kicker}</p>
          <h2 className="mt-4 font-display text-2xl font-extrabold text-loyal-800 sm:text-3xl">
            {dict.sponsors.title}
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {sponsors.map((s) => (
              <span
                key={s.name}
                className={`rounded-2xl border px-6 py-4 font-display text-sm font-bold ${
                  s.tier === "gold"
                    ? "border-gold-400 bg-gold-300/10 text-loyal-800"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="bg-cta overflow-hidden rounded-[2.5rem] px-6 py-14 text-center text-white sm:px-16">
          <h2 className="font-display text-3xl font-extrabold text-balance sm:text-4xl">
            {dict.ctaBanner.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">{dict.ctaBanner.text}</p>
          <Link
            href={`/${locale}/inscription`}
            className="mt-8 inline-block rounded-full bg-gold-400 px-10 py-4 font-display text-sm font-extrabold uppercase tracking-wide text-loyal-900 shadow-xl transition hover:scale-[1.03] hover:bg-gold-300"
          >
            {dict.ctaBanner.button}
          </Link>
        </div>
      </section>
    </>
  );
}
