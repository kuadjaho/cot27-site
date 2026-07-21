import Link from "next/link";

/**
 * 404 du segment [locale]. Le hook not-found ne reçoit pas les params :
 * la page est donc volontairement bilingue.
 */
export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="font-display text-7xl font-black text-loyal-800">
        4<span className="text-gold-500">0</span>4
      </p>
      <h1 className="mt-6 font-display text-2xl font-extrabold text-loyal-800">
        Cette page n&apos;existe pas{" "}
        <span className="font-semibold text-slate-400">· This page does not exist</span>
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-slate-600">
        Le lien est peut-être erroné, ou la page arrive plus tard dans la
        préparation de COT27. <span className="text-slate-400">The link may be
        wrong, or the page is coming later as COT27 takes shape.</span>
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/fr"
          className="rounded-full bg-loyal-700 px-8 py-3.5 font-display text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-loyal-600"
        >
          ← Accueil
        </Link>
        <Link
          href="/en"
          className="rounded-full border border-loyal-200 px-8 py-3.5 font-display text-sm font-extrabold uppercase tracking-wide text-loyal-700 transition hover:border-loyal-700"
        >
          Home (EN)
        </Link>
      </div>
    </section>
  );
}
