"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";

export default function Navbar({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/programme`, label: dict.nav.program },
    { href: `/${locale}/intervenants`, label: dict.nav.speakers },
    { href: `/${locale}/infos`, label: dict.nav.venue },
    { href: `/${locale}/galerie`, label: dict.nav.gallery },
    { href: `/${locale}/magazine`, label: dict.nav.magazine },
  ];

  // Bascule fr <-> en en conservant la page courante
  const otherLocale: Locale = locale === "fr" ? "en" : "fr";
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-loyal-900/95 text-white backdrop-blur supports-[backdrop-filter]:bg-loyal-900/85">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 font-display text-sm font-extrabold text-loyal-900">
            27
          </span>
          <span className="hidden font-display text-sm font-bold uppercase tracking-wider sm:block">
            COT27 <span className="font-semibold text-white/60">· Cotonou 2027</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? "bg-white/10 text-gold-300"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={switchedPath}
            className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:border-gold-300 hover:text-gold-300"
            title={otherLocale === "fr" ? "Version française" : "English version"}
          >
            {otherLocale.toUpperCase()}
          </Link>
          <Link
            href={`/${locale}/inscription`}
            className="hidden rounded-full bg-gold-400 px-5 py-2 text-sm font-bold text-loyal-900 shadow-lg shadow-gold-500/20 transition hover:bg-gold-300 sm:block"
          >
            {dict.nav.register}
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10 lg:hidden"
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
        <div className="border-t border-white/10 bg-loyal-900 px-4 pb-4 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-semibold ${
                isActive(link.href) ? "bg-white/10 text-gold-300" : "text-white/85"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/inscription`}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full bg-gold-400 px-4 py-3 text-center text-sm font-bold text-loyal-900"
          >
            {dict.nav.register}
          </Link>
        </div>
      )}
    </header>
  );
}
