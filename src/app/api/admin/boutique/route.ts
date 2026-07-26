import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { listeAchat } from "@/lib/boutique";

/**
 * Liste d'achat agrégée + détail par acheteur, en CSV.
 *
 * C'est la finalité du modèle de pré-commande : « 12 × Pin Président » à
 * recopier sur shop.toastmasters.org pour passer UNE commande groupée, puis le
 * détail par personne pour la remise en main propre pendant la conférence.
 *
 * `listeAchat` EXCLUT les réservations en attente et annulées. Le kit d'origine
 * rappelle le piège vécu : commander sur une liste qui contient des paniers
 * abandonnés fait payer en dollars des épinglettes que personne n'a réservées.
 */
export async function GET() {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: await headers() });
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { docs } = await payload.find({
    collection: "reservations",
    limit: 10000,
    sort: "createdAt",
    pagination: false,
  });

  type Ligne = {
    slug: string;
    nom: string;
    prixUnitaire: number;
    quantite: number;
  };

  const reservations = docs.map((r) => ({
    statut: r.statut as string,
    lignes: ((r.lignes ?? []) as Ligne[]).map((l) => ({
      slug: l.slug,
      nom: l.nom,
      prixUnitaire: l.prixUnitaire,
      quantite: l.quantite,
      sousTotal: l.prixUnitaire * l.quantite,
    })),
  }));

  const achat = listeAchat(reservations);
  const echapper = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const lignesCsv: string[] = [];

  lignesCsv.push("LISTE D'ACHAT AGREGEE (reservations confirmees uniquement)");
  lignesCsv.push(["Quantite", "Article", "Slug"].join(","));
  for (const a of achat) {
    lignesCsv.push([a.quantite, echapper(a.nom), echapper(a.slug)].join(","));
  }
  lignesCsv.push("");
  lignesCsv.push(
    `Total epinglettes a commander,${achat.reduce((s, a) => s + a.quantite, 0)}`
  );
  lignesCsv.push("");
  lignesCsv.push("DETAIL PAR ACHETEUR (pour la remise)");
  lignesCsv.push(
    [
      "Reference",
      "Prenom",
      "Nom",
      "Email",
      "Telephone",
      "Club",
      "Statut",
      "Total FCFA",
      "Articles",
    ].join(",")
  );

  for (const r of docs) {
    const lignes = (r.lignes ?? []) as Ligne[];
    lignesCsv.push(
      [
        echapper(r.reference),
        echapper(r.prenom),
        echapper(r.nom),
        echapper(r.email),
        echapper(r.telephone),
        echapper(r.club),
        echapper(r.statut),
        r.totalFcfa,
        echapper(lignes.map((l) => `${l.quantite} × ${l.nom}`).join(" ; ")),
      ].join(",")
    );
  }

  return new NextResponse(lignesCsv.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cot27-epinglettes.csv"',
    },
  });
}
