import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { countries } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import NewsletterSignup from "@/components/NewsletterSignup";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).discover.title };
}

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  const cards = [
    {
      href: `/${locale}/decouvrir/premiere-fois`,
      icon: "🌱",
      title: dict.discover.firstTimeCard,
      text: dict.discover.firstTimeCardText,
    },
    {
      href: `/${locale}/decouvrir/convaincre-mon-employeur`,
      icon: "💼",
      title: dict.discover.employerCard,
      text: dict.discover.employerCardText,
    },
    {
      href: `/${locale}/benin`,
      icon: "🌍",
      title: dict.discover.beninCard,
      text: dict.discover.beninCardText,
    },
  ];

  return (
    <>
      <PageHeader title={dict.discover.title} subtitle={dict.discover.subtitle} />

      {/* ------------------------------------------------ VISION */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="section-kicker">{dict.discover.visionKicker}</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800 text-balance sm:text-4xl">
              {dict.discover.visionTitle}
            </h2>
            <p className="mt-5 leading-relaxed text-slate-600">
              {dict.discover.visionText1}
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              {dict.discover.visionText2}
            </p>
          </div>
          <div className="bg-cta rounded-[2.5rem] p-10 text-center text-white">
            <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-gold-300">
              {dict.hero.kicker}
            </p>
            <p className="mt-6 font-display text-4xl font-black leading-tight">
              « {dict.hero.theme} »
            </p>
            <p className="mt-6 text-white/70">{dict.hero.dates}</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ PAYS */}
      <section className="bg-motif-light border-y border-loyal-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="section-kicker justify-center">{dict.discover.countriesKicker}</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800">
            {dict.discover.countriesTitle}
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {countries.map((country) => (
              <span
                key={country.name.fr}
                className="inline-flex items-center gap-2 rounded-full border border-loyal-100 bg-[#fdfcf9] px-5 py-2.5 text-sm font-bold text-loyal-800"
              >
                <span className="text-xl" aria-hidden>
                  {country.flag}
                </span>
                {country.name[locale]}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">{dict.discover.countriesNote}</p>
        </div>
      </section>

      {/* ------------------------------------------------ PAR OÙ COMMENCER */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="section-kicker">{dict.discover.startKicker}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-3xl border border-loyal-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="text-4xl" aria-hidden>
                {card.icon}
              </span>
              <h3 className="mt-4 font-display text-xl font-extrabold text-loyal-800 group-hover:text-maroon-600">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.text}</p>
              <span className="mt-5 inline-block text-sm font-bold text-loyal-700 group-hover:text-maroon-600">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <NewsletterSignup locale={locale} source="decouvrir" />
    </>
  );
}
