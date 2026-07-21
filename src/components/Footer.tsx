import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";
import { convention } from "@/lib/content";

export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDict(locale);

  const links = [
    { href: `/${locale}/programme`, label: dict.nav.program },
    { href: `/${locale}/intervenants`, label: dict.nav.speakers },
    { href: `/${locale}/infos`, label: dict.nav.venue },
    { href: `/${locale}/galerie`, label: dict.nav.gallery },
    { href: `/${locale}/inscription`, label: dict.nav.register },
  ];

  return (
    <footer className="bg-loyal-950 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 font-display text-sm font-extrabold text-loyal-900">
              D130
            </span>
            <span className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Convention 2026
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

      <div className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-6xl px-4 text-xs sm:px-6">
          <p>
            © 2026 District 130 Toastmasters — {dict.footer.rights}
          </p>
          <p className="mt-1 text-white/40">{dict.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
