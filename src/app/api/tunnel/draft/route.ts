import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getPayload } from "payload";
import config from "@payload-config";

// Sauvegarde de progression du tunnel (§6.1) : le client envoie son état à
// chaque changement d'étape ; le token permet la reprise depuis un lien.

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const etape = Math.min(3, Math.max(0, Number(body.etape) || 0));
  const data = (
    typeof body.data === "object" && body.data !== null ? body.data : {}
  ) as { [k: string]: unknown };
  const token = typeof body.token === "string" && body.token.length >= 16 ? body.token : null;

  const payload = await getPayload({ config });

  if (token) {
    const existing = await payload.find({
      collection: "brouillons",
      where: { token: { equals: token } },
      limit: 1,
    });
    if (existing.docs[0]) {
      await payload.update({
        collection: "brouillons",
        id: existing.docs[0].id,
        data: { etape, data },
      });
      return NextResponse.json({ token });
    }
  }

  const fresh = randomUUID();
  await payload.create({
    collection: "brouillons",
    data: { token: fresh, etape, data },
  });
  return NextResponse.json({ token: fresh });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (token.length < 16) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "brouillons",
    where: { token: { equals: token } },
    limit: 1,
  });

  const draft = found.docs[0];
  if (!draft) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ etape: draft.etape, data: draft.data });
}
