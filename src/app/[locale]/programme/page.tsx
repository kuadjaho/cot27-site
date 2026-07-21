import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import ScheduleTabs from "@/components/ScheduleTabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).program.title };
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <PageHeader title={dict.program.title} subtitle={dict.program.subtitle} />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <ScheduleTabs locale={locale} />
      </section>
    </>
  );
}
