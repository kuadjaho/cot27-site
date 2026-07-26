import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Statut d'une inscription, pour le rafraîchissement en direct de la page de
 * confirmation. Adressé par le jeton aléatoire (jamais par l'identifiant
 * séquentiel), et ne renvoie QUE le statut et le mode de paiement — aucune
 * donnée personnelle — pour rester sans risque même si l'URL fuite.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "MISSING_REF" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const found = await payload
    .find({
      collection: "inscriptions",
      where: { qrToken: { equals: ref } },
      limit: 1,
      depth: 0,
    })
    .catch(() => null);

  const inscription = found?.docs[0];
  if (!inscription) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json(
    { statut: inscription.statut, modePaiement: inscription.modePaiement },
    // Jamais de cache : le statut change côté serveur via le webhook FedaPay.
    { headers: { "Cache-Control": "no-store" } }
  );
}
