import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { isLocale } from "@/lib/i18n";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
  }

  const payload = await getPayload({ config });

  // Dédoublonnage : une adresse déjà inscrite reste un succès (idempotent).
  const existing = await payload.find({
    collection: "abonnes",
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existing.totalDocs === 0) {
    await payload.create({
      collection: "abonnes",
      data: {
        email,
        langue: isLocale(String(body.locale)) ? (String(body.locale) as "fr" | "en") : "fr",
        source: String(body.source ?? "").slice(0, 100) || null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
