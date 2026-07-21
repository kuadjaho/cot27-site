import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { firstTimeSteps, glossary } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).firstTime.title };
}

export default async function FirstTimePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <PageHeader title={dict.firstTime.title} subtitle={dict.firstTime.subtitle} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {firstTimeSteps.map((step, i) => (
            <div
              key={step.title.fr}
              className="flex gap-5 rounded-3xl border border-loyal-100 bg-white p-7 shadow-sm"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl" aria-hidden>
                  {step.icon}
                </span>
                <span className="font-display text-xs font-extrabold text-gold-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-loyal-800">
                  {step.title[locale]}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.text[locale]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ LEXIQUE */}
      <section className="border-y border-loyal-100 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="section-kicker">{dict.firstTime.glossaryTitle}</p>
          <dl className="mt-8 space-y-4">
            {glossary.map((entry) => (
              <div
                key={entry.term}
                className="rounded-2xl border border-loyal-100 bg-[#fdfcf9] px-6 py-4 sm:flex sm:gap-6"
              >
                <dt className="w-40 shrink-0 font-display font-extrabold text-maroon-600">
                  {entry.term}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600 sm:mt-0">
                  {entry.def[locale]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <Link
          href={`/${locale}/inscription`}
          className="inline-block rounded-full bg-gold-400 px-10 py-4 font-display text-sm font-extrabold uppercase tracking-wide text-loyal-900 shadow-xl shadow-gold-500/25 transition hover:scale-[1.03] hover:bg-gold-300"
        >
          {dict.firstTime.cta}
        </Link>
      </section>
    </>
  );
}
