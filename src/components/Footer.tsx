import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { brand, convention } from "@/lib/content";

export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDict(locale);

  const links = [
    { href: `/${locale}/decouvrir`, label: dict.nav.discover },
    { href: `/${locale}/programme`, label: dict.nav.program },
    { href: `/${locale}/intervenants`, label: dict.nav.speakers },
    { href: `/${locale}/benin`, label: dict.nav.benin },
    { href: `/${locale}/infos`, label: dict.nav.venue },
    { href: `/${locale}/galerie`, label: dict.nav.gallery },
    { href: `/${locale}/magazine`, label: dict.nav.magazine },
    { href: `/${locale}/inscription`, label: dict.nav.register },
  ];

  return (
    <footer className="bg-loyal-950 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 font-display text-sm font-extrabold text-loyal-900">
              {brand.mark}
            </span>
            <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
              {brand.name}
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{dict.footer.tagline}</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-300">
            {dict.footer.links}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-gold-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold-300">
            {dict.footer.contact}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${convention.email}`} className="hover:text-gold-300">
                {convention.email}
              </a>
            </li>
            <li>
              <a href={`tel:${convention.phone.replace(/\s/g, "")}`} className="hover:text-gold-300">
                {convention.phone}
              </a>
            </li>
            <li>{convention.venue}, {convention.city}</li>
          </ul>
        </div>
      </div>

      {/* Bloc d'affiliation — le logo Toastmasters occupe sa propre section, seul
          et non altéré, jamais côte à côte avec un autre logo (manuel de marque
          p. 38). Fichier officiel du Brand Portal, affiché à 96 px de large,
          au-dessus du minimum de 72 px imposé par la p. 8.
          Le fond est Loyal Blue #004165 (bg-loyal-700) et non le bleu nuit du
          reste du pied de page : la p. 12 interdit de poser le logo sur une
          couleur absente de la palette de marque, et le SVG étant transparent,
          le fond transparaît dans les contre-formes du logo. */}
      <div className="border-t border-white/10 bg-loyal-700 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/toastmasters-logo-white.svg"
            alt="Toastmasters International"
            width={96}
            height={80}
            className="h-20 w-24"
          />
          <p className="mt-4 max-w-md text-xs leading-relaxed text-white/50">
            {dict.footer.affiliation}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-6xl px-4 text-xs sm:px-6">
          <p>
            © 2027 {brand.name} · {brand.legalName[locale]} — {dict.footer.rights}
          </p>
          {/* Mention imposée mot pour mot par le manuel de marque (p. 34). */}
          <p className="mt-3 text-white/40">{dict.footer.tmDisclaimer}</p>
          {dict.footer.tmDisclaimerFr && (
            <p className="mt-1 text-white/40">{dict.footer.tmDisclaimerFr}</p>
          )}
          <p className="mt-3 text-white/30">{dict.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
