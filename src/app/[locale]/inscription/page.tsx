import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { fedapayEnabled } from "@/lib/fedapay";
import PageHeader from "@/components/PageHeader";
import RegistrationForm from "@/components/RegistrationForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).register.title };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <>
      <PageHeader title={dict.register.title} subtitle={dict.register.subtitle} />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <RegistrationForm locale={locale} onlinePaymentEnabled={fedapayEnabled()} />
      </section>
    </>
  );
}
