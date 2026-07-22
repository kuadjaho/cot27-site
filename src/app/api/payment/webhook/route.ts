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

  // Les webhooks n'arrivent pas dans l'ordre d'émission, et FedaPay retente
  // les livraisons en échec. Sans cette garde, un `declined` retardé — celui
  // d'une première saisie de code PIN ratée, par exemple — arrivait après le
  // `approved` du second essai réussi et annulait une inscription bel et bien
  // payée. Une inscription payée ne redevient donc jamais annulée sur la foi
  // d'un événement d'échec ; seul un remboursement, traité à la main dans
  // l'administration, doit pouvoir défaire un paiement.
  const inscription = await payload.findByID({
    collection: "inscriptions",
    id: inscriptionId,
  });

  if (inscription.statut === "payee" && newStatut !== "approuve") {
    console.warn(
      `[fedapay] Événement « ${event.entity?.status} » ignoré pour l'inscription ` +
        `${inscriptionId} : elle est déjà payée. Un remboursement se traite ` +
        `depuis l'administration.`
    );
    return NextResponse.json({ ok: true, ignored: "already_paid" });
  }

  await payload.update({
    collection: "inscriptions",
    id: inscriptionId,
    data: { statut: newStatut === "approuve" ? "payee" : "annulee" },
  });

  return NextResponse.json({ ok: true });
}
