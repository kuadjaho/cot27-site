import type { Metadata } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, isLocale, getDict, type Locale } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterSW from "@/components/RegisterSW";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700", "800", "900"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.meta.title,
      template: `%s · COT27`,
    },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en", "x-default": "/fr" },
    },
    openGraph: {
      type: "website",
      siteName: "COT27",
      title: dict.meta.title,
      description: dict.meta.description,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
      url: `/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
    applicationName: "COT27",
    keywords: [
      "Toastmasters",
      "District 130",
      "COT27",
      "Cotonou",
      "Bénin",
      locale === "fr" ? "conférence" : "conference",
      locale === "fr" ? "art oratoire" : "public speaking",
    ],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    // Les variables de police vont sur <html>, pas sur <body> : les jetons
    // @theme de Tailwind v4 (--font-display, --font-body) sont émis sur :root
    // et y résolvent leur var(). Posées sur <body>, elles étaient invisibles
    // depuis :root — --font-display devenait vide et TOUT le site rendait avec
    // la pile système, alors que 64 Ko de polices étaient bel et bien chargés.
    <html
      lang={locale}
      className={`${montserrat.variable} ${sourceSans.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <a href="#contenu" className="skip-link">
          {locale === "fr" ? "Aller au contenu" : "Skip to content"}
        </a>
        <Navbar locale={locale as Locale} />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer locale={locale as Locale} />
        <RegisterSW />
      </body>
    </html>
  );
}
