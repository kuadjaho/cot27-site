import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { tickets, formatFCFA } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Espace admin" };

// ---------------------------------------------------------------------------
// Formulaire de connexion
// ---------------------------------------------------------------------------
function LoginForm({ locale }: { locale: string }) {
  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-24 sm:px-6">
      <h1 className="font-display text-3xl font-black text-loyal-800">
        Espace admin
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Accès réservé au comité d&apos;organisation.
      </p>
      <form
        method="POST"
        action="/api/admin/login"
        className="mt-8 space-y-4 rounded-3xl border border-loyal-100 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="redirect" value={`/${locale}/admin`} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-loyal-800">
            Mot de passe
          </span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="w-full rounded-xl border border-loyal-200 px-4 py-3 text-sm outline-none focus:border-loyal-500 focus:ring-2 focus:ring-loyal-200"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-loyal-700 py-3 font-display text-sm font-bold text-white transition hover:bg-loyal-600"
        >
          Se connecter
        </button>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tableau de bord
// ---------------------------------------------------------------------------
const statusLabels: Record<string, { label: string; className: string }> = {
  PAID: { label: "✓ Payé", className: "bg-emerald-100 text-emerald-800" },
  PENDING: { label: "⏳ En attente", className: "bg-amber-100 text-amber-800" },
  ONSITE: { label: "🏛 Sur place", className: "bg-loyal-100 text-loyal-800" },
  CANCELLED: { label: "✗ Annulé", className: "bg-rose-100 text-rose-800" },
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  if (!(await isAdminAuthenticated())) {
    return <LoginForm locale={locale} />;
  }

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  const paid = registrations.filter((r) => r.status === "PAID");
  const pending = registrations.filter((r) => r.status === "PENDING");
  const revenue = paid.reduce((sum, r) => sum + r.amount, 0);
  const expected = registrations
    .filter((r) => r.status !== "CANCELLED")
    .reduce((sum, r) => sum + r.amount, 0);

  const stats = [
    { label: "Inscriptions", value: String(registrations.length) },
    { label: "Paiements reçus", value: String(paid.length) },
    { label: "Revenu encaissé", value: formatFCFA(revenue, "fr") },
    { label: "Revenu attendu", value: formatFCFA(expected, "fr") },
  ];

  // Répartition par pass (une seule mesure → barres monochromes)
  const byTicket = tickets.map((t) => ({
    name: t.name.fr,
    count: registrations.filter(
      (r) => r.ticketType === t.key && r.status !== "CANCELLED"
    ).length,
  }));
  const maxCount = Math.max(1, ...byTicket.map((t) => t.count));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-loyal-800">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Inscriptions à la Convention D130 2026
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/admin/export"
            className="rounded-full bg-loyal-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-loyal-600"
          >
            ⬇ Export CSV
          </a>
          <form method="POST" action="/api/admin/logout">
            <button className="rounded-full border border-loyal-200 px-6 py-2.5 text-sm font-bold text-loyal-700 hover:border-loyal-700">
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      {/* Tuiles de synthèse */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-loyal-100 bg-white p-6 shadow-sm"
          >
            <div className="text-sm font-semibold text-slate-500">{stat.label}</div>
            <div className="mt-1 font-display text-2xl font-black text-loyal-800">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Répartition par pass */}
      <div className="mt-8 rounded-3xl border border-loyal-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-bold text-loyal-800">
          Répartition par pass
        </h2>
        <div className="mt-4 space-y-3">
          {byTicket.map((t) => (
            <div key={t.name} className="flex items-center gap-4">
              <span className="w-56 shrink-0 truncate text-sm font-semibold text-slate-600">
                {t.name}
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded-md bg-loyal-50">
                <div
                  className="h-full rounded-md bg-loyal-600"
                  style={{ width: `${(t.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-bold tabular-nums text-loyal-800">
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des inscrits */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-loyal-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-loyal-100 bg-loyal-50 text-left font-display text-xs uppercase tracking-wider text-loyal-700">
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Club</th>
                <th className="px-4 py-3">Pass</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-loyal-100/70">
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Aucune inscription pour le moment.
                  </td>
                </tr>
              )}
              {registrations.map((r) => {
                const status = statusLabels[r.status] ?? statusLabels.PENDING;
                const ticket = tickets.find((t) => t.key === r.ticketType);
                return (
                  <tr key={r.id} className="hover:bg-loyal-50/50">
                    <td className="px-4 py-3 font-semibold text-loyal-900">
                      {r.firstName} {r.lastName}
                      <div className="font-mono text-[0.65rem] font-normal text-slate-400">
                        {r.id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.email}
                      <div className="text-xs text-slate-400">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.club ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {ticket?.name.fr ?? r.ticketType}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-loyal-800">
                      {formatFCFA(r.amount, "fr")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {r.createdAt.toLocaleDateString("fr-FR")}{" "}
                      {r.createdAt.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
