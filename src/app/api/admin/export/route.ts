import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
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
    "Type",
    "Pass",
    "Montant (FCFA)",
    "Statut",
    "Paiement",
    "Date",
  ];

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const rows = registrations.map((r) =>
    [
      r.id,
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      r.club ?? "",
      r.city ?? "",
      r.country,
      r.memberType,
      r.ticketType,
      String(r.amount),
      r.status,
      r.paymentMethod,
      r.createdAt.toISOString(),
    ]
      .map(escape)
      .join(";")
  );

  // BOM UTF-8 pour une ouverture propre dans Excel
  const csv = "﻿" + [header.map(escape).join(";"), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="inscriptions-d130-2026.csv"',
    },
  });
}
