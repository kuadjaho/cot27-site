import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

/** Valide un code promo et retourne son pourcentage de réduction. */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code) return NextResponse.json({ valid: false });

  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "codes-promo",
    where: { and: [{ code: { equals: code } }, { actif: { equals: true } }] },
    limit: 1,
  });

  const promo = found.docs[0];
  if (!promo) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, pct: promo.reductionPct, code });
}
