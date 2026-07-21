import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

/** Export CSV des inscriptions — réservé aux utilisateurs connectés à l'admin Payload. */
export async function GET() {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: await headers() });
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { docs } = await payload.find({
    collection: "inscriptions",
    depth: 1,
    limit: 10000,
    sort: "-createdAt",
  });

  const header = [
    "Reference",
    "Prenom",
    "Nom",
    "Email",
    "Telephone",
    "Club",
    "Ville",
    "Pays",
    "Categorie",
    "Montant (FCFA)",
    "Statut",
    "Mode de paiement",
    "Date",
  ];

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const rows = docs.map((i) => {
    const p = typeof i.participant === "object" ? i.participant : null;
    return [
      `COT27-${String(i.id).padStart(5, "0")}`,
      p?.prenom ?? "",
      p?.nom ?? "",
      p?.email ?? "",
      p?.telephone ?? "",
      p?.club ?? "",
      p?.ville ?? "",
      p?.pays ?? "",
      i.categorie,
      String(i.montant),
      i.statut ?? "",
      i.modePaiement ?? "",
      i.createdAt,
    ]
      .map((v) => escape(String(v)))
      .join(";");
  });

  // BOM UTF-8 pour une ouverture propre dans Excel
  const csv = "﻿" + [header.map(escape).join(";"), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inscriptions-cot27.csv"',
    },
  });
}
