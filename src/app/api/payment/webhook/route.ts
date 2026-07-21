import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { verifyWebhookSignature } from "@/lib/fedapay";

// Webhook FedaPay : configurez l'URL <site>/api/payment/webhook dans votre
// tableau de bord FedaPay pour les événements "transaction.approved" etc.
// Idempotent : rejouer le même événement ne change pas l'état final.
export async function POST(request: NextRequest) {
  const rawPayload = await request.text();

  const valid = await verifyWebhookSignature(
    rawPayload,
    request.headers.get("x-fedapay-signature")
  );
  if (!valid) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  let event: { name?: string; entity?: { id?: number | string; status?: string } };
  try {
    event = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const transactionId = event.entity?.id;
  if (!transactionId) return NextResponse.json({ ok: true });

  const paiementStatut: Record<string, "approuve" | "refuse" | "annule"> = {
    approved: "approuve",
    transferred: "approuve",
    declined: "refuse",
    canceled: "annule",
  };
  const newStatut = event.entity?.status
    ? paiementStatut[event.entity.status]
    : undefined;
  if (!newStatut) return NextResponse.json({ ok: true });

  const payload = await getPayload({ config });

  const paiements = await payload.find({
    collection: "paiements",
    where: { referenceExterne: { equals: String(transactionId) } },
    limit: 1,
  });
  const paiement = paiements.docs[0];
  if (!paiement) return NextResponse.json({ ok: true });

  await payload.update({
    collection: "paiements",
    id: paiement.id,
    data: { statut: newStatut, payloadWebhook: event },
  });

  const inscriptionId =
    typeof paiement.inscription === "object"
      ? paiement.inscription.id
      : paiement.inscription;

  await payload.update({
    collection: "inscriptions",
    id: inscriptionId,
    data: { statut: newStatut === "approuve" ? "payee" : "annulee" },
  });

  return NextResponse.json({ ok: true });
}
