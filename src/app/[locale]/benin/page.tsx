import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { excursions, beninPratique, hotels, formatFCFA } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import NewsletterSignup from "@/components/NewsletterSignup";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).benin.title };
}

export default async function BeninPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <PageHeader title={dict.benin.title} subtitle={dict.benin.subtitle} />

      {/* ------------------------------------------------ EXCURSIONS */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="section-kicker">{dict.benin.excursionsKicker}</p>
        <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800 sm:text-4xl">
          {dict.benin.excursionsTitle}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {excursions.map((exc) => (
            <article
              key={exc.key}
              className="group flex flex-col overflow-hidden rounded-3xl border border-loyal-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="relative flex h-40 items-center justify-center text-5xl"
                style={{
                  background: `linear-gradient(150deg, hsl(${exc.hue} 55% 24%), hsl(${exc.hue} 60% 42%))`,
                }}
              >
                <span aria-hidden>{exc.icon}</span>
                <span className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white backdrop-blur">
                  {exc.duration[locale]}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-extrabold text-loyal-800">
                  {exc.name[locale]}
                </h3>
                <p className="text-sm font-bold text-maroon-600">{exc.tagline[locale]}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {exc.text[locale]}
                </p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 rounded-2xl border border-gold-400/60 bg-gold-300/15 px-5 py-3.5 text-sm font-medium text-loyal-800">
          ★ {dict.benin.excursionsNote}
        </p>
      </section>

      {/* ------------------------------------------------ PRATIQUE */}
      <section className="border-y border-loyal-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="section-kicker">{dict.benin.pratiqueKicker}</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800">
            {dict.benin.pratiqueTitle}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {beninPratique.map((item) => (
              <div
                key={item.title.fr}
                className="rounded-3xl border border-loyal-100 bg-[#fdfcf9] p-6 shadow-sm"
              >
                <span className="text-3xl" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-loyal-800">
                  {item.title[locale]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.text[locale]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ HÉBERGEMENT */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="section-kicker">{dict.benin.stayKicker}</p>
        <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800">
          {dict.benin.stayTitle}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {hotels.map((hotel) => (
            <div
              key={hotel.name}
              className="rounded-3xl border border-loyal-100 bg-white p-6 shadow-sm"
            >
              <div className="text-gold-500" aria-label={`${hotel.stars} étoiles`}>
                {"★".repeat(hotel.stars)}
                <span className="text-slate-300">{"★".repeat(5 - hotel.stars)}</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-loyal-800">
                {hotel.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{hotel.distance[locale]}</p>
              <p className="mt-4 font-display text-xl font-extrabold text-maroon-600">
                {formatFCFA(hotel.price, locale)}
                <span className="text-sm font-semibold text-slate-500">
                  {" "}
                  {getDict(locale).venue.perNight}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ CULTURE → MAGAZINE */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="bg-cta overflow-hidden rounded-[2.5rem] px-6 py-12 text-center text-white sm:px-16">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-gold-300">
            {dict.benin.cultureKicker}
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-balance">
            {dict.benin.cultureTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">{dict.benin.cultureText}</p>
          {/* Règle posée : la pastille dorée ne pointe QUE vers l'inscription.
              Elle menait ici vers un article de magazine, si bien que la même
              couleur promettait deux actions différentes selon la page. */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/${locale}/inscription`}
              className="inline-block rounded-full bg-gold-400 px-8 py-3.5 font-display text-sm font-extrabold uppercase tracking-wide text-loyal-900 shadow-xl transition hover:scale-[1.02] hover:bg-gold-300"
            >
              {dict.ctaBanner.button}
            </Link>
            <Link
              href={`/${locale}/magazine/early-bird-2026/benin-trois-escales`}
              className="inline-block rounded-full border border-white/30 px-6 py-3 text-sm font-bold transition hover:border-gold-300 hover:text-gold-300"
            >
              {dict.benin.cultureCta}
            </Link>
          </div>
        </div>
      </section>

      <NewsletterSignup locale={locale} source="benin" />
    </>
  );
}
