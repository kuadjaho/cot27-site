import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { employerArguments, employerLetter } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import EmployerLetter from "@/components/EmployerLetter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).employer.title };
}

export default async function EmployerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <PageHeader title={dict.employer.title} subtitle={dict.employer.subtitle} />

      {/* ------------------------------------------------ ARGUMENTAIRE */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="section-kicker">{dict.employer.argsKicker}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {employerArguments.map((arg) => (
            <div
              key={arg.title.fr}
              className="rounded-3xl border border-loyal-100 bg-white p-7 shadow-sm"
            >
              <span className="text-3xl" aria-hidden>
                {arg.icon}
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-loyal-800">
                {arg.title[locale]}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {arg.text[locale]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ LETTRE-TYPE */}
      <section className="border-t border-loyal-100 bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="section-kicker">{dict.employer.letterKicker}</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-loyal-800">
            {dict.employer.letterTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {dict.employer.letterHint}
          </p>
          <div className="mt-8">
            <EmployerLetter locale={locale} letter={employerLetter[locale]} />
          </div>
        </div>
      </section>
    </>
  );
}
