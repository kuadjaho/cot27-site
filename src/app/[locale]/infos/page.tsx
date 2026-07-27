import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { hotels, faqs, travelTips, formatFCFA } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).venue.title };
}

export default async function VenuePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <PageHeader title={dict.venue.title} subtitle={dict.venue.subtitle} />

      {/* ------------------------------------------------ LIEU */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="section-kicker">{dict.venue.venueTitle}</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800">
              {dict.venue.venueName}
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">{dict.venue.venueText}</p>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-loyal-700">
              <span aria-hidden>📍</span> {dict.venue.address}
            </p>
          </div>
          <div className="flex flex-col overflow-hidden rounded-3xl border border-loyal-100 shadow-sm">
            <iframe
              title={dict.venue.mapTitle}
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.395%2C6.340%2C2.445%2C6.370&layer=mapnik&marker=6.3550%2C2.4200"
              className="h-72 w-full flex-1 border-0 bg-loyal-50 sm:min-h-72"
              loading="lazy"
            />
            <a
              href="https://www.openstreetmap.org/?mlat=6.3550&mlon=2.4200#map=15/6.3550/2.4200"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-loyal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-loyal-600"
            >
              {dict.venue.mapTitle}
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ HÔTELS */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="section-kicker">{dict.venue.hotelsTitle}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
            {dict.venue.hotelsText}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {hotels.map((hotel) => (
              <div
                key={hotel.name}
                className="rounded-3xl border border-loyal-100 bg-[#fdfcf9] p-6 shadow-sm"
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
                    {dict.venue.perNight}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ VOYAGE */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="section-kicker">{dict.venue.travelTitle}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {travelTips.map((tip) => (
            <div
              key={tip.title.fr}
              className="rounded-3xl border border-loyal-100 bg-white p-6 shadow-sm"
            >
              <span className="text-3xl" aria-hidden>
                {tip.icon}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-loyal-800">
                {tip.title[locale]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {tip.text[locale]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="section-kicker">{dict.venue.faqTitle}</p>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q.fr}
                className="group rounded-2xl border border-loyal-100 bg-[#fdfcf9] px-6 py-4 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-bold text-loyal-800 [&::-webkit-details-marker]:hidden">
                  {faq.q[locale]}
                  <span className="text-gold-500 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {faq.a[locale]}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
