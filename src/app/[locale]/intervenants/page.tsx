import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { speakers } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import SpeakerCard from "@/components/SpeakerCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).speakers.title };
}

export default async function SpeakersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <PageHeader title={dict.speakers.title} subtitle={dict.speakers.subtitle} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {speakers.map((speaker) => (
            <SpeakerCard key={speaker.name} speaker={speaker} locale={locale} />
          ))}
        </div>
      </section>
    </>
  );
}
