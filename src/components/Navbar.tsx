"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { brand } from "@/lib/content";

export default function Navbar({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Navigation cible du cahier des charges (§3.1) — 7 entrées maximum,
  // le logo ramène à l'accueil, « Infos pratiques » vit dans le footer.
  const links = [
    { href: `/${locale}/decouvrir`, label: dict.nav.discover },
    { href: `/${locale}/programme`, label: dict.nav.program },
    { href: `/${locale}/intervenants`, label: dict.nav.speakers },
    { href: `/${locale}/benin`, label: dict.nav.benin },
    { href: `/${locale}/galerie`, label: dict.nav.gallery },
    { href: `/${locale}/magazine`, label: dict.nav.magazine },
    { href: `/${locale}/boutique`, label: dict.nav.boutique },
  ];

  // Bascule fr <-> en en conservant la page courante
  const otherLocale: Locale = locale === "fr" ? "en" : "fr";
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  // Barre blanche, largement opaque. À 85 %, le flou d'arrière-plan laissait
  // remonter les couleurs des pages — cartes d'intervenants, vignettes de la
  // galerie — et teintait la barre de violet ou de vert : elle ne se lisait
  // plus comme blanche.
  return (
    <header className="sticky top-0 z-50 border-b border-loyal-100 bg-white/98 text-loyal-900 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 font-display text-sm font-extrabold text-loyal-900">
            {brand.mark}
          </span>
          {/* Le nom reste visible à toutes les tailles : masqué sous 640 px, il
              ne laissait qu'une pastille « 27 » muette, sur laquelle rien
              n'indiquait où l'on se trouvait. Seul le lieu-année, redondant
              avec le contenu de la page, se retire sur petit écran. */}
          <span className="font-display text-sm font-bold uppercase tracking-wider">
            {brand.name}
            <span className="max-sm:hidden font-semibold text-loyal-500 sm:inline">
              {" "}
              · Cotonou 2027
            </span>
          </span>
        </Link>

        {/* `max-lg:hidden` plutôt que `hidden` : la règle exprime la même
            intention — masqué en dessous de 1024 px — mais sans employer la
            classe générique `.hidden`, que certaines extensions de navigateur
            réquisitionnent avec un `!important` qui neutralise ensuite tous les
            points de rupture. Constaté sur un poste de travail du comité. */}
        <div className="max-lg:hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              // L'état actif passe en Loyal Blue et non en Happy Yellow : sur
              // fond blanc, le jaune de marque tombe à un contraste de 1,3:1,
              // très en deçà du seuil de 4,5:1 exigé par la WCAG 2.2 AA.
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? "bg-loyal-50 text-loyal-700"
                  : "text-loyal-800 hover:bg-loyal-50 hover:text-loyal-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={switchedPath}
            className="rounded-full border border-loyal-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-loyal-700 transition-colors hover:border-loyal-700 hover:bg-loyal-50"
            title={otherLocale === "fr" ? "Version française" : "English version"}
          >
            {otherLocale.toUpperCase()}
          </Link>
          <Link
            href={`/${locale}/inscription`}
            // Visible à TOUTES les tailles. Il était masqué sous 640 px : sur
            // douze pages sur treize, le seul lien d'inscription atteignable
            // était alors un lien de pied de page, à 82 % de la hauteur du
            // document — alors que le public arrive majoritairement sur
            // mobile, par un lien partagé dans un groupe WhatsApp. Il se
            // compacte au lieu de disparaître.
            className="shrink-0 rounded-full bg-gold-400 px-3.5 py-2 text-xs font-bold text-loyal-900 shadow-lg shadow-gold-500/20 transition hover:bg-gold-300 sm:px-5 sm:text-sm"
          >
            {dict.nav.register}
          </Link>
          <button
            // `max-lg:flex` et non `flex` : accolée à `lg:hidden`, la classe
            // générique `.flex` peut être redéfinie par une feuille tierce
            // injectée après celle du site, et le bouton reste alors affiché
            // sur grand écran à côté des liens. Deux variantes responsives
            // n'ont pas ce problème.
            className="max-lg:flex h-10 w-10 items-center justify-center rounded-full text-loyal-800 hover:bg-loyal-50 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-loyal-100 bg-white px-4 pb-4 shadow-lg lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-semibold ${
                isActive(link.href)
                  ? "bg-loyal-50 text-loyal-700"
                  : "text-loyal-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/inscription`}
            onClick={() => setOpen(false)}
            // Traité comme une action, pas comme une huitième rubrique : en
            // graisse et casse du système, avec une ombre, il se distingue de
            // la liste de liens qui le précède.
            className="mt-3 block rounded-full bg-gold-400 px-4 py-3 text-center font-display text-sm font-extrabold uppercase tracking-wide text-loyal-900 shadow-xl shadow-gold-500/25"
          >
            {dict.nav.register}
          </Link>
        </div>
      )}
    </header>
  );
}
